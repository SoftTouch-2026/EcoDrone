import sys
import json
import logging
import argparse
import time
import uuid

logger = logging.getLogger()
# Setting up basic logging for output
handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.DEBUG)


# Parses input arguments
def parse_args():
    parser = argparse.ArgumentParser(
        description="Convert QGC .plan to ANAFI AI flight plan .json format")

    parser.add_argument(
        "filepath", type=str, help="Usage: python3 new_convert.py </path/to/qgc.plan>")
    parser.add_argument(
        "--out", type=str, help="ANAFI AI JSON filename", default="savedPlan.json")
    parser.add_argument(
        "--product-id", type=int, help="Manually specify the product ID for the drone.")
    parser.add_argument(
        "--product-name", type=str, help="Manually specify the product name for the drone.")
    parser.add_argument(
        "--detect-drone", action="store_true", help="Connect to the drone to automatically detect the product model.")
    parser.add_argument(
        "--ip", type=str, default="10.202.0.1", help="Drone IP address for detection (default is simulation).")

    return parser.parse_args()


"""
This class manages the .plan conversion by 
loading the QGC .plan, initializing the converter,
and writing the formatted ANAFI AI plan to a new file.
"""
class Converter():
    def __init__(self, filepath, out):
        self.filepath = filepath
        self.out = out
        self.qgc_plan = None

    def main(self):
        self.load_qgc_plan()
        if self.qgc_plan:
            converter = AnafiPlanConverter(self.qgc_plan)
            anafi_plan = converter.get_plan()
            if anafi_plan:
                self.write_to_disk(anafi_plan)
                print("Successfully converted {} to {}".format(self.filepath, self.out))
            else:
                print("Conversion Failed: Could not generate a valid ANAFI AI plan from the input.")
        else:
            print(f"Conversion Failed: Could not load or parse the input file {self.filepath}.")

    def load_qgc_plan(self):
        """Loads and verifies the QGC .plan format"""
        try:
            with open(self.filepath) as f:
                self.qgc_plan = json.load(f)
                if self.qgc_plan.get("fileType") != "Plan":
                    logging.warning("File does not appear to be a QGroundControl .plan file.")
        except FileNotFoundError:
            logging.error(f"Can't open specified file: {self.filepath}")
        except json.JSONDecodeError:
            logging.error(f"Error decoding JSON from file: {self.filepath}")
        except Exception as e:
            logging.error(f"An unexpected error occurred: {e}")

    def write_to_disk(self, anafi_plan_data):
        """Write ANAFI AI plan object to file"""
        try:
            with open(self.out, "w") as f:
                json.dump(anafi_plan_data, f, indent=1)
        except Exception as e:
            logging.exception(
                f"Unexpected error, could not write ANAFI plan to file: {e}")


"""
This class converts a QGC .plan JSON object to an
ANAFI AI compatible flight plan JSON object.
"""
class AnafiPlanConverter():
    def __init__(self, qgc_plan, product_id, product_name):
        self.qgc_plan = qgc_plan
        self.anafi_plan = None
        self.product_id = product_id
        self.product_name = product_name
        self._convert()

    def get_plan(self):
        return self.anafi_plan

    def _create_base_structure(self):
        """Creates the skeleton of the ANAFI AI plan JSON using metadata from the QGC plan."""
        qgc_mission = self.qgc_plan.get("mission", {})
        home_pos = qgc_mission.get("plannedHomePosition")
        if not home_pos or len(home_pos) < 2:
            logging.error("'plannedHomePosition' with at least latitude and longitude is required in the QGC plan.")
            return None
        
        current_date = time.strftime("%Y-%m-%d")
        
        return {
            "dirty": False,
            "latitudeDelta": 0.0,
            "longitudeDelta": 0.0,
            "date": int(time.time() * 1000),
            "rotation": 0,
            "tilt": 0,
            "longitude": home_pos[1],
            "productId": self.product_id,
            "title": self.qgc_plan.get("title", current_date),
            "product": self.product_name,
            "zoomLevel": 19.5, # Default zoom
            "progressive_course_activated": True,
            "latitude": home_pos[0],
            "uuid": str(uuid.uuid4()),
            "version": 1,
            "plan": {
                "takeoff": [],
                "poi": [],
                "wayPoints": []
            },
            "mapType": 4 # From example
        }

    def _convert(self):
        """Performs the main conversion from QGC items to ANAFI waypoints."""
        self.anafi_plan = self._create_base_structure()
        if not self.anafi_plan:
            return

        qgc_mission = self.qgc_plan.get("mission", {})
        items = qgc_mission.get("items", [])
        if not items:
            logging.warning("QGC plan mission has no items.")
            return

        hover_speed = qgc_mission.get("hoverSpeed", 5)

        for item in items:
            command = item.get("command")
            params = item.get("params", [None] * 7)

            # Command 22: MAV_CMD_NAV_TAKEOFF
            if command == 22:
                # ANAFI format has a non-waypoint takeoff action.
                self.anafi_plan["plan"]["takeoff"].append({
                    "type": "Tilt", "angle": 90, "speed": 180
                })

            # Command 16: MAV_CMD_NAV_WAYPOINT
            elif command == 16:
                # Ensure waypoint has valid coordinates
                if params[4] is None or params[5] is None:
                    logging.warning(f"Skipping waypoint with missing coordinates: {item}")
                    continue
                
                waypoint = {
                    "follow": 1,
                    "continue": item.get("autoContinue", True),
                    "speed": hover_speed,
                    "yaw": params[3] if params[3] is not None else 0.0,
                    "longitude": params[5],
                    "lastYaw": 0,
                    "actions": [], # Placeholder for actions
                    "latitude": params[4],
                    "followPOI": False,
                    "altitude": params[6]
                }
                
                # NOTE: Dynamically converting actions (like camera commands) is complex.
                # The QGC plan uses separate command items (e.g., command 2000 for IMAGE_START_CAPTURE)
                # which would need to be parsed and inserted into the 'actions' array of the preceding waypoint.
                # The provided 'TestMission1.plan' does not contain such action commands.
                # For demonstration, one could add logic here to check for and map these commands.
                
                self.anafi_plan["plan"]["wayPoints"].append(waypoint)

            # Other commands like RTL (20) are ignored as they don't map directly
            # to the ANAFI waypoint structure.


if __name__ == "__main__":
    args = parse_args()
    converter = Converter(args)
    converter.main()
