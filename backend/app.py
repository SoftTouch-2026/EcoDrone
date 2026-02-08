
"""
EcoDrone API Server - Fixed Version
"""

import os
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
