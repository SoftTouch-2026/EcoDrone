"""
EcoDrone Shared Constants - Mission States and Limits

Constants used across both Cloud Backend and Ground Station.
"""

# Safety Limits
MIN_BATTERY_LEVEL = 20  # Minimum battery % to start mission
MIN_BATTERY_RTH = 30    # Minimum battery % to trigger return-to-home
MAX_WIND_SPEED_MPS = 10  # Maximum wind speed in m/s

# Physical Limits (ANAFI Ai)
MAX_ALTITUDE_METERS = 120  # Regulatory limit
MAX_RANGE_METERS = 4000    # Maximum range from home
MAX_PAYLOAD_GRAMS = 500    # Maximum payload weight

# Mission Timing
MISSION_TIMEOUT_SECONDS = 1800  # 30 minutes max per mission
HEARTBEAT_INTERVAL_SECONDS = 5  # How often to send telemetry
COMMAND_TIMEOUT_SECONDS = 30    # How long to wait for command response

# Geofencing (Example - Ashesi Campus bounds)
# These should be configured per deployment
GEOFENCE_BOUNDS = {
    "min_latitude": 5.7570,
    "max_latitude": 5.7620,
    "min_longitude": -0.2260,
    "max_longitude": -0.2210,
}

# Connection Settings
GROUND_STATION_POLL_INTERVAL = 2  # Seconds between checking for new missions
TELEMETRY_BUFFER_SIZE = 100       # Number of telemetry points to buffer offline

# Drone States
DRONE_STATUS_AVAILABLE = "available"
DRONE_STATUS_IN_MISSION = "in_mission"
DRONE_STATUS_MAINTENANCE = "maintenance"
DRONE_STATUS_OFFLINE = "offline"

# Flight States
FLIGHT_STATE_LANDED = "landed"
FLIGHT_STATE_TAKING_OFF = "taking_off"
FLIGHT_STATE_HOVERING = "hovering"
FLIGHT_STATE_FLYING = "flying"
FLIGHT_STATE_LANDING = "landing"
FLIGHT_STATE_EMERGENCY = "emergency"
