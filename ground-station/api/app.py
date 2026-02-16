
"""
EcoDrone API Server - Fixed Version
"""

import os
import sys

# Add controllers directory to python path
current_dir = os.path.dirname(os.path.abspath(__file__))
controllers_dir = os.path.join(os.path.dirname(current_dir), 'controllers')
sys.path.append(controllers_dir)

from flask import Flask, jsonify, request
from flask_cors import CORS
from drone_controller import get_drone_controller, OLYMPE_AVAILABLE
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("EcoDrone-API")

app = Flask(__name__)
CORS(app)

CONNECTION_MODE = os.environ.get("DRONE_CONNECTION_MODE", "auto")
drone = get_drone_controller(CONNECTION_MODE)

@app.route('/')
def index():
    return jsonify({
        "name": "EcoDrone API",
        "version": "1.0.0",
        "status": "running"
    })

@app.route('/api/status', methods=['GET'])
def get_status():
    try:
        status = drone.get_status()
        return jsonify({"success": True, "data": status})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/connect', methods=['POST'])
def connect():
    try:
        result = drone.connect()
        if isinstance(result, dict):
            success = result.get("success", True)
            message = result.get("message", "Connected")
        else:
            success = bool(result)
            message = "Connected" if success else "Connection failed"
        
        return jsonify({
            "success": success,
            "message": message,
            "data": drone.get_status()
        })
    except Exception as e:
        logger.error(f"Connect error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/disconnect', methods=['POST'])
def disconnect():
    try:
        result = drone.disconnect()
        if isinstance(result, dict):
            success = result.get("success", True)
            message = result.get("message", "Disconnected")
        else:
            success = bool(result)
            message = "Disconnected" if success else "Disconnect failed"
        
        return jsonify({
            "success": success,
            "message": message,
            "data": drone.get_status()
        })
    except Exception as e:
        logger.error(f"Disconnect error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/takeoff', methods=['POST'])
def takeoff():
    try:
        status = drone.get_status()
        if not status.get("connected", False):
            return jsonify({
                "success": False,
                "message": "Drone not connected",
                "data": status
            }), 400
        
        battery = status.get("battery_level", 0)
        if battery < 20:
            return jsonify({
                "success": False,
                "message": f"Battery too low ({battery}%)",
                "data": status
            }), 400
        
        result = drone.takeoff()
        if isinstance(result, dict):
            success = result.get("success", True)
            message = result.get("message", "Taking off")
        else:
            success = bool(result)
            message = "Taking off" if success else "Takeoff failed"
        
        return jsonify({
            "success": success,
            "message": message,
            "data": drone.get_status()
        })
    except Exception as e:
        logger.error(f"Takeoff error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/land', methods=['POST'])
def land():
    try:
        status = drone.get_status()
        if not status.get("connected", False):
            return jsonify({
                "success": False,
                "message": "Drone not connected",
                "data": status
            }), 400
        
        result = drone.land()
        if isinstance(result, dict):
            success = result.get("success", True)
            message = result.get("message", "Landing")
        else:
            success = bool(result)
            message = "Landing" if success else "Land failed"
        
        return jsonify({
            "success": success,
            "message": message,
            "data": drone.get_status()
        })
    except Exception as e:
        logger.error(f"Land error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/navigate', methods=['POST'])
def navigate():
    """Fly to GPS coordinates (equivalent to CLI 'goto' command)"""
    try:
        status = drone.get_status()
        if not status.get("connected", False):
            return jsonify({
                "success": False,
                "message": "Drone not connected",
                "data": status
            }), 400
        
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No JSON body provided"}), 400
        
        latitude = data.get("latitude")
        longitude = data.get("longitude")
        altitude = data.get("altitude", 10)
        
        if latitude is None or longitude is None:
            return jsonify({"success": False, "message": "latitude and longitude are required"}), 400
        
        result = drone.fly_to_coordinates(float(latitude), float(longitude), float(altitude))
        if isinstance(result, dict):
            success = result.get("success", True)
            message = result.get("message", "Navigating")
        else:
            success = bool(result)
            message = "Navigating" if success else "Navigation failed"
        
        return jsonify({
            "success": success,
            "message": message,
            "data": drone.get_status()
        })
    except Exception as e:
        logger.error(f"Navigate error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/move', methods=['POST'])
def move():
    """Move relative to current position (equivalent to CLI 'move' command)"""
    try:
        status = drone.get_status()
        if not status.get("connected", False):
            return jsonify({
                "success": False,
                "message": "Drone not connected",
                "data": status
            }), 400
        
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No JSON body provided"}), 400
        
        forward = float(data.get("forward", 0))
        right = float(data.get("right", 0))
        up = float(data.get("up", 0))
        rotation = float(data.get("rotation", 0))
        
        result = drone.move_by(forward, right, up, rotation)
        if isinstance(result, dict):
            success = result.get("success", True)
            message = result.get("message", "Moving")
        else:
            success = bool(result)
            message = "Moving" if success else "Move failed"
        
        return jsonify({
            "success": success,
            "message": message,
            "data": drone.get_status()
        })
    except Exception as e:
        logger.error(f"Move error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/battery', methods=['GET'])
def battery():
    """Get battery level"""
    try:
        status = drone.get_status()
        return jsonify({
            "success": True,
            "data": {
                "battery_level": status.get("battery_level", 0),
                "connected": status.get("connected", False)
            }
        })
    except Exception as e:
        logger.error(f"Battery error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "olympe": OLYMPE_AVAILABLE})

if __name__ == '__main__':
    print("=" * 50)
    print("  EcoDrone API Server")
    print("=" * 50)
    print(f"  Olympe SDK: {OLYMPE_AVAILABLE}")
    print(f"  Mode: {CONNECTION_MODE}")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5001, debug=True)
EOF
