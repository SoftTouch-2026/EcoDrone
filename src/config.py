"""
EcoDrone Ground Station - Configuration
System-wide settings for the ground station drone control system
"""

import os

# ==================== SYSTEM INFORMATION ====================

SYSTEM_NAME = "EcoDrone Ground Station"
SYSTEM_VERSION = "1.0.0 - Epic 1"
PLATFORM = "Ubuntu 22.04"

# ==================== DRONE SETTINGS ====================

# Default drone IP address (Parrot Anafi AI creates WiFi network)
DRONE_IP = os.environ.get("DRONE_IP", "192.168.42.1")

# Flight parameters
DEFAULT_TAKEOFF_ALTITUDE = 10  # meters
DEFAULT_FLIGHT_SPEED = 2  # m/s
GPS_NAVIGATION_ALTITUDE = 10  # meters

# ==================== BATTERY SETTINGS ====================

# Minimum battery level to allow flight (percentage)
MIN_BATTERY_LEVEL = 20

# Battery capacity for standard Anafi AI (mAh)
DEFAULT_BATTERY_CAPACITY = 4900

# Low battery warning threshold (percentage)
LOW_BATTERY_WARNING = 25

# ==================== COMMUNICATION SETTINGS ====================

# Communication modes (in order of preference)
COMM_WIFI = "wifi"  # Direct WiFi (~300m range)
COMM_SKYCONTROLLER = "skycontroller"  # Via SkyController (2-4km line of sight)
COMM_LTE = "lte"  # Via LTE/4G (extended range, requires SIM card)

# Default communication mode
DEFAULT_COMM_MODE = COMM_WIFI

# ==================== FILE PATHS ====================

# Base directory for data storage
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
LOGS_DIR = os.path.join(DATA_DIR, "logs")

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)

# Data files
DRONE_REGISTRY_FILE = os.path.join(DATA_DIR, "drones.json")
BATTERY_LOGS_FILE = os.path.join(LOGS_DIR, "battery_logs.json")
FLIGHT_LOGS_FILE = os.path.join(LOGS_DIR, "flight_logs.json")

# ==================== LOGGING SETTINGS ====================

# Log format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# ==================== GEOFENCE SETTINGS (for future use) ====================

# Campus boundary (will be implemented in Epic 1.4)
CAMPUS_GEOFENCE = {
    "enabled": False,
    "boundary": []
}

# ==================== NOTES ====================

# Note: Raspberry Pi 3 sensor module is a SEPARATE system
# It is NOT part of the drone control system
# Environmental sensors (Temperature, CO, CO₂) are on Raspberry Pi 3, not integrated here
