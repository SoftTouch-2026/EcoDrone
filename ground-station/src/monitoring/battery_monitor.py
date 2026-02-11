"""
Battery Monitor
Monitors and logs battery levels, enforces safety checks (M-US1.3)
"""

import json
import os
from datetime import datetime
from typing import List, Dict, Optional

from models.drone_model import Drone
from config import BATTERY_LOGS_FILE, MIN_BATTERY_LEVEL, LOW_BATTERY_WARNING


class BatteryMonitor:
    """Monitors battery levels and enforces safety policies"""
    
    def __init__(self, log_file: str = BATTERY_LOGS_FILE):
        self.log_file = log_file
        self.battery_logs: List[Dict] = []
        self.load_logs()
    
    def load_logs(self):
        """Load battery logs from file"""
        if os.path.exists(self.log_file):
            try:
                with open(self.log_file, 'r') as file:
                    self.battery_logs = json.load(file)
                print(f"✓ Loaded {len(self.battery_logs)} battery log entries")
            except:
                self.battery_logs = []
        else:
            self.battery_logs = []
            self.save_logs()
    
    def save_logs(self):
        """Save battery logs to file"""
        try:
            with open(self.log_file, 'w') as file:
                json.dump(self.battery_logs, file, indent=2)
            return True
        except Exception as e:
            print(f"✗ Error saving logs: {e}")
            return False
    
    def log_battery_level(self, drone: Drone, battery_level: int, event_type: str = "routine_check") -> bool:
        """Log a battery level reading"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "drone_id": drone.drone_id,
            "battery_level": battery_level,
            "event_type": event_type
        }
        
        if battery_level < MIN_BATTERY_LEVEL:
            log_entry["warning"] = "CRITICAL"
            print(f"🔴 CRITICAL: {drone.name} battery at {battery_level}% - FLIGHT NOT PERMITTED")
        elif battery_level < LOW_BATTERY_WARNING:
            log_entry["warning"] = "LOW"
            print(f"🟡 WARNING: {drone.name} battery at {battery_level}%")
        
        self.battery_logs.append(log_entry)
        return self.save_logs()
    
    def check_battery_safety(self, drone: Drone) -> tuple[bool, str]:
        """Check if drone battery is safe for flight (implements M-US1.3 safety check)"""
        battery_level = drone.current_battery_level
        
        print(f"\n🔋 Battery Safety Check for {drone.name}")
        print(f"   Current: {battery_level}% | Minimum: {drone.min_battery_level}%")
        
        if battery_level < drone.min_battery_level:
            message = f"❌ FLIGHT DENIED - Battery {battery_level}% below minimum {drone.min_battery_level}%"
            print(f"   {message}")
            self.log_battery_level(drone, battery_level, "safety_violation")
            return False, message
        
        elif battery_level < LOW_BATTERY_WARNING:
            message = f"⚠️ CAUTION - Battery {battery_level}% is low"
            print(f"   {message}")
            self.log_battery_level(drone, battery_level, "low_battery_warning")
            return True, message
        
        else:
            message = f"✓ Battery sufficient ({battery_level}%)"
            print(f"   {message}")
            self.log_battery_level(drone, battery_level, "pre_flight_check")
            return True, message
    
    def print_battery_history(self, drone_id: Optional[str] = None, limit: int = 10):
        """Print formatted battery history"""
        logs = self.battery_logs
        if drone_id:
            logs = [log for log in logs if log["drone_id"] == drone_id]
        
        logs = logs[-limit:]
        
        if not logs:
            print("No battery history found")
            return
        
        print(f"\n{'='*80}")
        print(f"BATTERY HISTORY - Last {len(logs)} Entries")
        print(f"{'='*80}\n")
        for entry in logs:
            timestamp = datetime.fromisoformat(entry["timestamp"]).strftime("%Y-%m-%d %H:%M:%S")
            battery = entry["battery_level"]
            indicator = "🔴" if battery < MIN_BATTERY_LEVEL else "🟡" if battery < LOW_BATTERY_WARNING else "🟢"
            print(f"{indicator} [{timestamp}] {entry['drone_id']} - Battery: {battery}%")
        print(f"\n{'='*80}\n")
