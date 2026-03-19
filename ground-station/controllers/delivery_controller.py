"""
High-Precision GPS Delivery Controller
======================================
Implements autonomous delivery logic for Parrot ANAFI Ai with offset-correction
for GPS multipath interference.
"""

import time
import threading
import logging
import math
from typing import List, Tuple, Optional

logger = logging.getLogger("DeliveryController")

try:
    import olympe
    from olympe.messages.ardrone3.Piloting import TakeOff, Landing, moveBy, moveTo
    from olympe.messages.ardrone3.PilotingState import FlyingStateChanged, PositionChanged, AltitudeChanged, GpsLocationChanged
    from olympe.messages.ardrone3.GPSState import NumberOfSatelliteChanged
    from olympe.messages.common.CommonState import LinkSignalQuality
    from olympe.messages.ardrone3.GPSSettingsState import HomeChanged
    from olympe.messages.obstacle_avoidance import set_mode
    OLYMPE_AVAILABLE = True
except ImportError:
    OLYMPE_AVAILABLE = False
    logger.warning("Olympe SDK not available - running in SIMULATION mode")

class DeliveryController:
    def __init__(self, ip_address="192.168.42.1"):
        self.ip_address = ip_address
        self.drone: Optional['olympe.Drone'] = None
        self.connected = False
        
        # State tracking
        self.satellites = 0
        self.link_quality = 0
        self.current_lat = 0.0
        self.current_lon = 0.0
        self.current_alt = 0.0
        self.flying_state = "landed"
        self.hovering_since = 0.0
        self.link_drop_since = 0.0
        
        # Offset Correction
        self.logical_origin: Optional[Tuple[float, float]] = None
        self.offset_north = 0.0
        self.offset_east = 0.0
        
        # Flags
        self.manual_override = False
        self.mission_aborted = False
        
        # Threads
        self._monitor_thread = None
        self._stop_event = threading.Event()
        self._lock = threading.Lock()

    def connect(self) -> bool:
        """Connect to the drone (Wi-Fi or 4G)"""
        if not OLYMPE_AVAILABLE:
            logger.info("Simulation mode: Connected")
            self.connected = True
            return True
        
        try:
            self.drone = olympe.Drone(self.ip_address)
            self.connected = self.drone.connect()
            
            if self.connected:
                self._start_monitoring()
                # Enable obstacle avoidance standard
                self.drone(set_mode(mode="standard")).wait()
            return self.connected
        except Exception as e:
            logger.error(f"Connection failed: {e}")
            return False

    def disconnect(self) -> bool:
        self._stop_event.set()
        if not OLYMPE_AVAILABLE:
            self.connected = False
            return True
            
        if self.drone:
            self.drone.disconnect()
            self.connected = False
        return True

    def _start_monitoring(self):
        self._stop_event.clear()
        self._monitor_thread = threading.Thread(target=self._monitor_loop)
        self._monitor_thread.daemon = True
        self._monitor_thread.start()

    def _monitor_loop(self):
        """Continuous safety and state monitoring"""
        while not self._stop_event.is_set():
            if not self.drone:
                time.sleep(1)
                continue
                
            try:
                # Update Satellites
                sat_state = self.drone.get_state(NumberOfSatelliteChanged)
                if sat_state:
                    self.satellites = sat_state.get("numberOfSatellite", 0)
                
                # Update GPS Position
                gps_state = self.drone.get_state(GpsLocationChanged)
                if gps_state:
                    self.current_lat = gps_state.get("latitude", 0.0)
                    self.current_lon = gps_state.get("longitude", 0.0)
                    self.current_alt = gps_state.get("altitude", 0.0)
                
                # Update Flying State
                fly_state = self.drone.get_state(FlyingStateChanged)
                if fly_state:
                    new_state = fly_state.get("state", "landed")
                    if new_state == "hovering" and self.flying_state != "hovering":
                        self.hovering_since = time.time()
                    self.flying_state = new_state
                
                # Update Link Quality
                link_state = self.drone.get_state(LinkSignalQuality)
                if link_state:
                    self.link_quality = link_state.get("quality", 4) # 0-4 scale usually
                
                # Heartbeat failsafe: Link drop > 5s
                if self.link_quality < 2:
                    if self.link_drop_since == 0:
                        self.link_drop_since = time.time()
                    elif time.time() - self.link_drop_since > 5.0 and not self.mission_aborted:
                        logger.warning("Failsafe: 4G/WiFi link quality low for > 5s. Triggering RTH.")
                        self.abort_mission()
                else:
                    self.link_drop_since = 0.0

            except Exception as e:
                logger.error(f"Telemetry error: {e}")
            
            time.sleep(0.5)

    def trigger_manual_override(self):
        """Allow pilot to take control and halt autonomous execution"""
        with self._lock:
            self.manual_override = True
            self.mission_aborted = True
        logger.warning("Manual Override Triggered!")
        if self.drone and OLYMPE_AVAILABLE:
            # Stop any current movement and hover
            self.drone(moveBy(0, 0, 0, 0)).wait()

    def abort_mission(self):
        """Halt mission and attempt Return Home or safe landing"""
        with self._lock:
            self.mission_aborted = True
        if self.drone and OLYMPE_AVAILABLE:
            from olympe.messages.rth import return_to_home
            self.drone(return_to_home()).wait()

    def _state_check_wait(self, min_hover_time: float = 3.0) -> bool:
        """4G Latency wrapper: Only proceed if hovering for > 3 seconds"""
        timeout = time.time() + 30.0
        while time.time() < timeout:
            if self.mission_aborted:
                return False
            if self.flying_state == "hovering" and (time.time() - self.hovering_since) >= min_hover_time:
                return True
            time.sleep(0.5)
        return False

    def phase_a_calibration(self) -> bool:
        """Phase A: Calibration & Initial Bias Recording"""
        logger.info("Starting Phase A: Calibration")
        
        if not OLYMPE_AVAILABLE:
            self.logical_origin = (5.7597, -0.2199)
            self.offset_north = 0.1
            self.offset_east = 0.1
            return True

        # 1. GNSS Stabilization
        logger.info("Waiting for GNSS stabilization (min 14 satellites)")
        timeout = time.time() + 120.0
        while self.satellites < 14:
            if time.time() > timeout or self.mission_aborted:
                logger.error("Failed to acquire 14 satellites.")
                return False
            time.sleep(1)
            
        # 2. Logical Origin (LO) - Average over 10 seconds
        logger.info("Recording Logical Origin over 10 seconds")
        lats, lons = [], []
        for _ in range(20): # 20 samples = 10 sec @ 2Hz
            if self.mission_aborted: return False
            lats.append(self.current_lat)
            lons.append(self.current_lon)
            time.sleep(0.5)
            
        self.logical_origin = (sum(lats)/len(lats), sum(lons)/len(lons))
        lo_lat, lo_lon = self.logical_origin
        logger.info(f"Logical Origin: {lo_lat}, {lo_lon}")

        # 3. Calibration Hop
        logger.info("Executing Calibration Hop to 5m")
        self.drone(TakeOff() >> FlyingStateChanged(state="hovering", _timeout=30)).wait()
        
        if not self._state_check_wait(min_hover_time=3.0):
            return False

        logger.info("Moving back to exact Logical Origin coordinates")
        # Go to LO at 5m
        self.drone(moveTo(lo_lat, lo_lon, 5.0, 0) >> PositionChanged(_timeout=30)).wait()
        
        if not self._state_check_wait(min_hover_time=3.0):
            return False

        # Record Offset (Approximation in meters for simplicity)
        # 1 deg lat ~ 111139m. 1 deg lon ~ 111139m * cos(lat)
        curr_lat, curr_lon = self.current_lat, self.current_lon
        
        lat_diff_deg = curr_lat - lo_lat
        lon_diff_deg = curr_lon - lo_lon
        
        self.offset_north = lat_diff_deg * 111139.0
        self.offset_east = lon_diff_deg * (111139.0 * math.cos(math.radians(lo_lat)))
        
        logger.info(f"Initial Bias recorded: N={self.offset_north:.2f}m, E={self.offset_east:.2f}m")
        return True

    def phase_b_transit(self, waypoints: List[Tuple[float, float]], cruise_alt: float = 35.0) -> bool:
        """Phase B: Global Transit (High Altitude)"""
        logger.info(f"Starting Phase B: Transit at {cruise_alt}m")
        
        if self.mission_aborted: return False
        
        if not OLYMPE_AVAILABLE:
            time.sleep(2)
            return True

        # Ascend to cruise altitude
        # Move up from current alt to cruise alt
        alt_diff = cruise_alt - self.current_alt
        if alt_diff > 0:
            self.drone(moveBy(0, 0, -alt_diff, 0)).wait()
        
        if not self._state_check_wait():
            return False

        for i, wp in enumerate(waypoints):
            if self.mission_aborted: return False
            
            logger.info(f"Navigating to waypoint {i+1}/{len(waypoints)}: {wp}")
            self.drone(moveTo(wp[0], wp[1], cruise_alt, 0) >> PositionChanged(_timeout=60)).wait()
            
            if not self._state_check_wait():
                return False
                
        return True

    def phase_c_arrival(self) -> bool:
        """Phase C: Arrival & Offset Cancellation"""
        logger.info("Starting Phase C: Arrival & Offset Cancellation")
        
        if self.mission_aborted: return False
        
        if not OLYMPE_AVAILABLE:
            return True

        # 1. The Settle Period
        logger.info("Hovering to let EKF stabilize (10s)")
        time.sleep(10)
        
        if self.mission_aborted: return False

        # Check partial blocking during descent (min 8 satellites required initially)
        if self.satellites < 8:
            logger.warning("Satellite count < 8 during arrival. Pausing descent.")
            # We will wait up to 30s for satellites to improve
            start_wait = time.time()
            while self.satellites < 8 and (time.time() - start_wait) < 30.0:
                if self.mission_aborted: return False
                time.sleep(1)
            
            if self.satellites < 8:
                logger.error("Satellites failed to improve. Aborting landing.")
                self.abort_mission()
                return False

        # Descend to 5m before offset cancellation to ensure we bypass structure interference
        alt_diff = self.current_alt - 5.0
        if alt_diff > 0:
            logger.info("Descending to 5m")
            self.drone(moveBy(0, 0, alt_diff, 0)).wait()
            
        if not self._state_check_wait():
            return False

        # 2. Reverse Move (Inertial/Optical flow correction)
        logger.info(f"Applying inertial offset cancellation: N={-self.offset_north:.2f}m, E={-self.offset_east:.2f}m")
        # MoveBy coordinates: forward (North), right (East), down (Up)
        # Note: moveBy works relative to drone heading. Assuming heading is 0 (North) for simplicity in this logic, 
        # or we calculate relative to current heading. Olympe moveTo heading can be used.
        # For accurate reverse move in global frame we must account for current yaw.
        # Simplified: drone is facing North (heading 0).
        forward_move = -self.offset_north
        right_move = -self.offset_east
        
        result = self.drone(moveBy(forward_move, right_move, 0, 0)).wait()
        
        if not result.success():
            logger.error("Offset cancellation failed.")
            return False
            
        time.sleep(2) # brief settle

        if self.mission_aborted: return False

        # 3. Full Landing
        logger.info("Executing final landing")
        result = self.drone(Landing() >> FlyingStateChanged(state="landed", _timeout=60)).wait()
        
        if result.success():
            logger.info("Landing successful! Delivery complete.")
            return True
        else:
            logger.error("Landing failed.")
            return False

    def execute_delivery(self, waypoints: List[Tuple[float, float]]) -> dict:
        """Full delivery execution flow"""
        self.mission_aborted = False
        self.manual_override = False
        
        try:
            # Phase A
            if not self.phase_a_calibration():
                return {"success": False, "message": "Failed at Phase A"}
                
            # Phase B
            if not self.phase_b_transit(waypoints):
                return {"success": False, "message": "Failed at Phase B"}
                
            # Phase C
            if not self.phase_c_arrival():
                return {"success": False, "message": "Failed at Phase C"}
                
            return {"success": True, "message": "Delivery executed successfully."}
            
        except Exception as e:
            logger.error(f"Delivery sequence failed: {e}")
            self.abort_mission()
            return {"success": False, "message": f"Error: {str(e)}"}
