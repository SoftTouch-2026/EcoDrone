import olympe

def test_connection():
    try:
        print("Connecting to SkyController at 192.168.53.1...")
        drone = olympe.SkyController4("192.168.53.1")
        success = drone.connect()
        if success:
            print("Successfully connected to SkyController!")
            # Get state or just consider it OK.
            drone.disconnect()
            return True
        else:
            print("Failed to connect.")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    test_connection()
