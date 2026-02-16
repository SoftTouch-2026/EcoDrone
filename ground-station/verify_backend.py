import requests
import time
import json

BASE_URL = "http://localhost:5001"

def log(msg, status="INFO"):
    print(f"[{time.strftime('%H:%M:%S')}] [{status}] {msg}")

def test_endpoint(name, method, endpoint, data=None):
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            bs = requests.get(url)
        else:
            bs = requests.post(url, json=data)
        
        if bs.status_code == 200:
            res = bs.json()
            # For root endpoint, it returns status directly
            if endpoint == '/':
                 log(f"{name}: Success - {res.get('status')}", "PASS")
                 return True, res

            if res.get("success"):
                log(f"{name}: Success - {res.get('message')}", "PASS")
                return True, res
            else:
                log(f"{name}: Failed - {res.get('message')}", "FAIL")
                return False, res
        else:
            log(f"{name}: API Error {bs.status_code} - {bs.text}", "FAIL")
            return False, None
    except Exception as e:
        log(f"{name}: Connection Failed - {e}", "FAIL")
        return False, None

def run_verification():
    print("="*60)
    print("EcoDrone Backend Verification Script")
    print("="*60)

    # 1. Health Check
    if not test_endpoint("Health Check", "GET", "/")[0]:
        print("Backend not running? Please start 'python api/app.py'")
        return

    # 2. Connect
    test_endpoint("Connect Drone", "POST", "/api/connect")
    time.sleep(1)

    # 3. Takeoff
    test_endpoint("Takeoff", "POST", "/api/takeoff")
    time.sleep(10) # Wait for simulation to transition to hovering

    # 4. Navigate (GPS)
    log("Testing GPS Navigation...", "TEST")
    test_endpoint("Navigate (GPS)", "POST", "/api/navigate", {
        "latitude": 5.7610,
        "longitude": -0.2250,
        "altitude": 15
    })
    time.sleep(2)

    # 5. Move (Relative)
    log("Testing Relative Movement...", "TEST")
    test_endpoint("Move (Relative)", "POST", "/api/move", {
        "forward": 5,
        "right": 2,
        "up": 0,
        "rotation": 0
    })
    time.sleep(2)

    # 6. Status Check
    success, res = test_endpoint("Get Status", "GET", "/api/status")
    if success:
        data = res['data']
        log(f"Drone State: {data.get('state')} | Lat: {data.get('latitude')} | Lng: {data.get('longitude')}", "INFO")

    # 7. Land
    test_endpoint("Land", "POST", "/api/land")
    
    # 8. Disconnect
    test_endpoint("Disconnect", "POST", "/api/disconnect")

    print("="*60)
    print("Verification Complete")
    print("="*60)

if __name__ == "__main__":
    run_verification()
