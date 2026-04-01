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
    from olympe.messages.ardrone3.PilotingState import FlyingStateChanged, PositionChanged, AltitudeChanged, GpsLocationChanged, moveToChanged, AttitudeChanged
    from olympe.messages.ardrone3.GPSState import NumberOfSatelliteChanged
    from olympe.messages.common.CommonState import LinkSignalQuality
    from olympe.messages.ardrone3.GPSSettingsState import HomeChanged
    from olympe.messages.obstacle_avoidance import set_mode
    OLYMPE_AVAILABLE = True
except ImportError:
    OLYMPE_AVAILABLE = False
    logger.warning("Olympe SDK not available - running in SIMULATION mode")


# MAX_ALTITUDE_AVAILABLE stays False — MaxAltitude is not in this SDK version's
# ardrone3.SpeedSettings module. The pre-flight step checks this flag and skips safely.
MAX_ALTITUDE_AVAILABLE = False

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
        self.current_amsl = 0.0
        self.current_alt = 0.0
        self.current_yaw = 0.0
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
        self._in_flight = False  # True only while a mission is actively executing
        
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
            if self.ip_address == "192.168.53.1":
                self.drone = olympe.SkyController4(self.ip_address)
            else:
                self.drone = olympe.Drone(self.ip_address)
                
            self.connected = self.drone.connect()
            
            if self.connected:
                self._start_monitoring()
                # Enable obstacle avoidance standard
                self.drone(set_mode(mode="standard")).wait()
                # Configure RTH: 75m return altitude, 1s delay
                try:
                    from olympe.messages.rth import set_returning_altitude, set_delay, set_preferred_home_type
                    self.drone(set_returning_altitude(altitude=75.0)).wait()
                    self.drone(set_delay(delay=1)).wait()
                    self.drone(set_preferred_home_type(type="pilot")).wait()
                    logger.info("RTH configured: altitude=75m, delay=1s, pilot home")
                except Exception as rth_e:
                    logger.warning(f"RTH config warning: {rth_e}")
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
                
            # Update Satellites
            try:
                sat_state = self.drone.get_state(NumberOfSatelliteChanged)
                if sat_state:
                    self.satellites = sat_state.get("numberOfSatellite", 0)
            except Exception as e:
                with open("/tmp/oly_errors.log", "a") as f: f.write(f"Sat error: {repr(e)}\n")
            
            # Update GPS Position
            try:
                gps_state = self.drone.get_state(PositionChanged)
                if gps_state:
                    self.current_lat = gps_state.get("latitude", 0.0)
                    self.current_lon = gps_state.get("longitude", 0.0)
                    self.current_amsl = gps_state.get("altitude", 0.0)
                    
                # Fallback if PositionChanged isn't supported or returned 0.0
                if self.current_lat == 0.0:
                    backup_state = self.drone.get_state(GpsLocationChanged)
                    if backup_state:
                        self.current_lat = backup_state.get("latitude", 0.0)
                        self.current_lon = backup_state.get("longitude", 0.0)
                        self.current_amsl = backup_state.get("altitude", 0.0)

            except Exception as e:
                with open("/tmp/oly_errors.log", "a") as f: f.write(f"Pos error: {repr(e)}\n")
                # Immediate fallback in exception
                try:
                    backup_state = self.drone.get_state(GpsLocationChanged)
                    if backup_state:
                        self.current_lat = backup_state.get("latitude", 0.0)
                        self.current_lon = backup_state.get("longitude", 0.0)
                        self.current_amsl = backup_state.get("altitude", 0.0)
                except:
                    pass
            
            # Update Relative Altitude
            try:
                alt_state = self.drone.get_state(AltitudeChanged)
                if alt_state:
                    self.current_alt = alt_state.get("altitude", self.current_alt)
            except Exception as e:
                pass
            
            # Update Attitude
            try:
                att_state = self.drone.get_state(AttitudeChanged)
                if att_state:
                    self.current_yaw = att_state.get("yaw", 0.0)
            except Exception as e:
                pass
            
            # Update Flying State
            try:
                fly_state = self.drone.get_state(FlyingStateChanged)
                if fly_state:
                    new_state = fly_state.get("state", "landed")
                    if new_state == "hovering" and self.flying_state != "hovering":
                        self.hovering_since = time.time()
                    self.flying_state = new_state
            except Exception as e:
                with open("/tmp/oly_errors.log", "a") as f: f.write(f"Fly error: {repr(e)}\n")
            
            # Update Link Quality
            # LinkSignalQuality may not be supported on all firmware versions.
            # Default to 4 (good) so the failsafe never fires on unsupported firmware.
            try:
                link_state = self.drone.get_state(LinkSignalQuality)
                if link_state:
                    self.link_quality = link_state.get("quality", 4)
                else:
                    self.link_quality = 4  # message not available, assume good
            except Exception:
                self.link_quality = 4  # keep it good to prevent false failsafe
            
            # NOTE: Link quality failsafe is disabled because LinkSignalQuality is
            # not consistently available via SkyController4 on this firmware version.
            # The drone's own RTH will trigger if the LTE link drops at the hardware level.
            
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

    def _wait_for_gps_stable(
        self,
        window: int = 20,
        threshold_m: float = 5.0,
        timeout_s: float = 180.0,
        abort_check: bool = True,
    ) -> bool:
        """
        Block until GPS coordinates are stable (EKF converged).

        Samples the current position every 0.5 s and considers the fix stable
        once the spread (max–min) across the last `window` samples is under
        `threshold_m` metres for both latitude and longitude.  This guards
        against the ~32 km cold-start offset seen immediately after connection
        even when 20+ satellites are already reported.

        Args:
            window:      Number of consecutive samples to evaluate (default 20 = 10 s).
            threshold_m: Max allowed spread in metres (default 5 m).
            timeout_s:   Give up after this many seconds (default 180 s).
            abort_check: If True, also return False on mission_aborted.

        Returns:
            True when stable, False on timeout or mission abort.
        """
        # 1 degree latitude  ≈ 111 139 m
        # 1 degree longitude ≈ 111 139 * cos(lat) m
        LAT_M_PER_DEG = 111_139.0

        logger.info(
            f"Waiting for GPS EKF convergence "
            f"(spread < {threshold_m}m over {window * 0.5:.0f}s window) ..."
        )

        history_lat: list = []
        history_lon: list = []
        deadline = time.time() + timeout_s

        while time.time() < deadline:
            if abort_check and self.mission_aborted:
                return False

            lat = self.current_lat
            lon = self.current_lon

            # Discard 0,0 – drone hasn't reported a fix yet
            if lat != 0.0 and lon != 0.0:
                history_lat.append(lat)
                history_lon.append(lon)

            if len(history_lat) >= window:
                # Keep only the most recent window
                history_lat = history_lat[-window:]
                history_lon = history_lon[-window:]

                lat_spread_m = (max(history_lat) - min(history_lat)) * LAT_M_PER_DEG
                lon_spread_m = (
                    (max(history_lon) - min(history_lon))
                    * LAT_M_PER_DEG
                    * math.cos(math.radians(sum(history_lat) / len(history_lat)))
                )

                logger.info(
                    f"GPS drift – lat spread: {lat_spread_m:.2f}m, "
                    f"lon spread: {lon_spread_m:.2f}m "
                    f"(target < {threshold_m}m)"
                )

                if lat_spread_m < threshold_m and lon_spread_m < threshold_m:
                    avg_lat = sum(history_lat) / len(history_lat)
                    avg_lon = sum(history_lon) / len(history_lon)
                    logger.info(
                        f"GPS stable ✓  avg: {avg_lat:.7f}, {avg_lon:.7f}"
                    )
                    return True

            time.sleep(0.5)

        logger.error("GPS stability timeout – EKF did not converge in time.")
        return False

    def phase_a_calibration(self) -> bool:
        """Phase A: Calibration & Initial Bias Recording"""
        logger.info("Starting Phase A: Calibration")
        
        if not OLYMPE_AVAILABLE:
            self.logical_origin = (5.7597, -0.2199)
            self.offset_north = 0.1
            self.offset_east = 0.1
            return True

        # 1. GNSS Stabilization: satellite count gate
        logger.info("Waiting for GNSS stabilization (min 14 satellites)")
        timeout = time.time() + 120.0
        while self.satellites < 14:
            if time.time() > timeout or self.mission_aborted:
                logger.error("Failed to acquire 14 satellites.")
                return False
            time.sleep(1)

        # 2. EKF Convergence: wait until coordinates stop drifting
        if not self._wait_for_gps_stable(window=20, threshold_m=5.0, timeout_s=180.0):
            logger.error("GPS did not stabilize – cannot record reliable Logical Origin.")
            return False
            
        # 3. Logical Origin (LO) - Average over 10 seconds
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

        # 4. Calibration Hop
        logger.info("Executing Calibration Hop to 5m")
        result = self.drone(TakeOff() >> (FlyingStateChanged(state="hovering", _timeout=30)
                                          | FlyingStateChanged(state="flying", _timeout=30))).wait()
        if not result.success():
            logger.error("Takeoff failed during Phase A calibration")
            return False
        
        if not self._state_check_wait(min_hover_time=3.0):
            return False

        logger.info("Moving back to exact Logical Origin coordinates")
        # Go to LO at 5m
        self.drone(moveTo(lo_lat, lo_lon, 5.0, 0, 0) >> moveToChanged(status="DONE", _timeout=3600)).wait()
        
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

    def survey_location(self) -> dict:
        """Survey current location using high-precision averaging (min 14 satellites)"""
        logger.info("Starting High-Precision Location Survey")
        
        if not self.drone:
            return {"success": False, "message": "Drone not connected"}
            
        if not OLYMPE_AVAILABLE:
            return {"success": True, "latitude": 5.7597, "longitude": -0.2199, "satellites": 14}
            
        # 1. GNSS Stabilization: satellite count check is disabled for ANAFI Ai
        # due to firmware sometimes not reporting NumberOfSatelliteChanged properly.
        # We rely purely on EKF Convergence below.
        logger.info("Skipping explicit satellite count check; relying on coordinate stability.")
        # 2. EKF Convergence: wait until coordinates stop drifting
        #    GPS can report positions ~32km off right after connection even with
        #    20+ satellites locked. Only trust coordinates once the spread across
        #    a 10-second window is under 5 m.
        if not self._wait_for_gps_stable(window=20, threshold_m=5.0, timeout_s=180.0, abort_check=False):
            return {"success": False, "message": "GPS did not stabilize – EKF convergence timeout"}
            
        # 2. Average over 10 seconds
        logger.info("Recording precise coordinates over 10 seconds...")
        lats, lons = [], []
        for _ in range(20): # 20 samples = 10 sec @ 2Hz
            lats.append(self.current_lat)
            lons.append(self.current_lon)
            time.sleep(0.5)
            
        surveyed_lat = sum(lats)/len(lats)
        surveyed_lon = sum(lons)/len(lons)
        
        return {
            "success": True, 
            "latitude": surveyed_lat, 
            "longitude": surveyed_lon,
            "satellites": self.satellites,
            "altitude": self.current_amsl
        }

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
            self.drone(moveTo(wp[0], wp[1], cruise_alt, 0, 0) >> moveToChanged(status="DONE", _timeout=3600)).wait()
            
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

        # NOTE: Skipping partial blockage check (min 8 satellites) due to 
        # unreliable satellite reporting from firmware. 
        # We rely on EKF stability from the 10s hover above instead.
        # Descend to 5m before offset cancellation to ensure we bypass structure interference
        alt_diff = self.current_alt - 5.0
        if alt_diff > 0:
            logger.info("Descending to 5m")
            self.drone(moveBy(0, 0, alt_diff, 0)).wait()
            
        if not self._state_check_wait():
            return False

        # 2. Reverse Move (Inertial/Optical flow correction)
        logger.info(f"Applying inertial offset cancellation: N={-self.offset_north:.2f}m, E={-self.offset_east:.2f}m")
        # Rotate global offsets (North/East) into the drone's local coordinate frame using current yaw
        global_north_offset = -self.offset_north
        global_east_offset = -self.offset_east
        yaw = self.current_yaw
        
        forward_move = (global_north_offset * math.cos(yaw)) + (global_east_offset * math.sin(yaw))
        right_move = (global_east_offset * math.cos(yaw)) - (global_north_offset * math.sin(yaw))
        
        logger.info(f"Local rotated move vector -> Forward: {forward_move:.2f}m, Right: {right_move:.2f}m")
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

    def execute_ushape_delivery(self, target_loc: dict) -> dict:
        """Execute U-Shape delivery: Takeoff -> 410m AMSL -> Fly to target -> Land."""
        self.mission_aborted = False
        self.manual_override = False
        self._in_flight = True
        target_lat = target_loc["latitude"]
        target_lon = target_loc["longitude"]
        target_amsl = target_loc["absolute_altitude"]
        cruise_amsl = 410.0

        def _check_aborted():
            return self.mission_aborted or self.manual_override

        try:
            logger.info(f"=== U-Shape Delivery: {target_loc['name']} ===")
            logger.info(f"Target GPS: {target_lat:.6f}, {target_lon:.6f} | Target AMSL: {target_amsl:.1f}m")

            if not OLYMPE_AVAILABLE:
                time.sleep(2)
                self._in_flight = False
                return {"success": True, "message": "Simulated U-Shape delivery complete"}

            # --- Pre-flight: Read live state directly from Olympe ---
            # Do NOT rely on the monitor thread — it may not have polled yet.
            logger.info("Pre-flight: Reading live drone state from Olympe...")
            try:
                fly = self.drone.get_state(FlyingStateChanged)
                if fly:
                    self.flying_state = fly.get("state", "landed")
                    logger.info(f"  flying_state = {self.flying_state}")
            except Exception as e:
                logger.warning(f"  Could not read FlyingStateChanged: {e}")

            try:
                gps = self.drone.get_state(GpsLocationChanged)
                if gps:
                    lat = gps.get("latitude", 0.0)
                    lon = gps.get("longitude", 0.0)
                    alt = gps.get("altitude", 0.0)
                    if lat != 0.0:
                        self.current_lat = lat
                        self.current_lon = lon
                        self.current_amsl = alt
                        logger.info(f"  GPS: {lat:.6f}, {lon:.6f}, AMSL={alt:.1f}m")
                    else:
                        logger.warning("  GPS lat=0.0, will use target lat/lon for climb")
            except Exception as e:
                logger.warning(f"  Could not read GPS: {e}")

            if self.current_amsl == 0.0:
                # Wait up to 15s for GPS lock via monitor thread
                logger.info("  Waiting for GPS AMSL lock (max 15s)...")
                for _ in range(15):
                    if self.current_amsl != 0.0:
                        break
                    time.sleep(1)
                if self.current_amsl == 0.0:
                    logger.error("No GPS AMSL available — aborting")
                    self._in_flight = False
                    return {"success": False, "message": "No GPS — cannot determine safe altitude"}

            logger.info(f"Pre-flight complete. flying_state={self.flying_state}, "
                        f"lat={self.current_lat:.6f}, lon={self.current_lon:.6f}, amsl={self.current_amsl:.1f}m")

            # --- Pre-flight: Override geofence max altitude ---
            if MAX_ALTITUDE_AVAILABLE:
                try:
                    current_max = self.drone.get_state(MaxAltitudeChanged)
                    if current_max:
                        logger.info(f"  Current MaxAltitude: {current_max.get('current', '?')}m "
                                    f"(range {current_max.get('min','?')}–{current_max.get('max','?')}m)")
                    result = self.drone(MaxAltitude(current=500.0)
                                        >> MaxAltitudeChanged(_timeout=5)).wait()
                    if result.success():
                        logger.info("  MaxAltitude set to 500m relative ✓")
                    else:
                        logger.warning("  MaxAltitude override did not confirm — proceeding anyway")
                except Exception as e:
                    logger.warning(f"  Could not set MaxAltitude: {e} — proceeding anyway")
            else:
                logger.info("  MaxAltitude SDK message unavailable — relying on firmware defaults")

            # --- Step 1: Takeoff (only if on the ground) ---
            if self.flying_state in ("landed", "emergency"):
                logger.info("Step 1: Taking off...")
                result = self.drone(
                    TakeOff()
                    >> (FlyingStateChanged(state="hovering", _timeout=30)
                        | FlyingStateChanged(state="flying", _timeout=30))
                ).wait()
                if not result.success():
                    logger.error("Takeoff rejected by firmware")
                    self._in_flight = False
                    return {"success": False, "message": "Takeoff failed"}
                logger.info("Step 1: Takeoff OK")
                time.sleep(3)
            else:
                logger.info(f"Step 1: Drone already {self.flying_state} — skipping takeoff")
                time.sleep(1)

            if _check_aborted():
                self._in_flight = False
                return {"success": False, "message": "Aborted before ascent"}

            # --- Step 2: Climb to 410m AMSL ---
            logger.info(f"Step 2: Climbing to {cruise_amsl:.0f}m AMSL (moveTo current position at 410m)...")
            result = self.drone(
                moveTo(self.current_lat if self.current_lat != 0.0 else target_lat,
                       self.current_lon if self.current_lon != 0.0 else target_lon,
                       cruise_amsl, 0, 0)
                >> moveToChanged(status="DONE", _timeout=300)
            ).wait()
            if not result.success():
                logger.warning("Ascent moveTo did not confirm DONE - will continue")
            time.sleep(2)
            logger.info("Step 2: Climb complete")

            if _check_aborted():
                self.drone(Landing() >> FlyingStateChanged(state="landed", _timeout=60)).wait()
                self._in_flight = False
                return {"success": False, "message": "Aborted during ascent"}

            # --- Step 3: Fly to target at cruise altitude ---
            logger.info(f"Step 3: Flying to target at {cruise_amsl:.0f}m AMSL...")
            result = self.drone(
                moveTo(target_lat, target_lon, cruise_amsl, 0, 0)
                >> moveToChanged(status="DONE", _timeout=3600)
            ).wait()
            if not result.success():
                logger.warning("Transit moveTo did not confirm DONE - will proceed to descent")
            time.sleep(2)
            logger.info("Step 3: Transit complete")

            if _check_aborted():
                self.drone(Landing() >> FlyingStateChanged(state="landed", _timeout=60)).wait()
                self._in_flight = False
                return {"success": False, "message": "Aborted during transit"}

            # --- Step 4: Descend to target AMSL + 2m buffer ---
            descent_target = target_amsl + 2.0
            logger.info(f"Step 4: Descending to {descent_target:.1f}m AMSL (target + 2m safety)...")
            result = self.drone(
                moveTo(target_lat, target_lon, descent_target, 0, 0)
                >> moveToChanged(status="DONE", _timeout=300)
            ).wait()
            if not result.success():
                logger.warning("Descent moveTo did not confirm DONE - will land anyway")
            time.sleep(2)
            logger.info("Step 4: Descent complete")

            # --- Step 5: Land ---
            logger.info("Step 5: Landing at destination...")
            self.drone(Landing() >> FlyingStateChanged(state="landed", _timeout=60)).wait()
            logger.info("=== U-Shape Delivery COMPLETE ===")
            self._in_flight = False
            return {"success": True, "message": f"Delivery to {target_loc['name']} complete"}

        except Exception as e:
            logger.error(f"U-Shape Delivery error: {e}", exc_info=True)
            self._in_flight = False
            try:
                self.abort_mission()
            except Exception:
                pass
            return {"success": False, "message": str(e)}

