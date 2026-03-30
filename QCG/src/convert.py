import sys
import json
import logging
import argparse

from config import LATEST_VERSION, DEFAULT_FILE_NAME, TAKEOFF, WAYPOINT

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


# Parses input arguments
def parse_args():
    parser = argparse.ArgumentParser(
        description="Convert QGC .plan to .mavlink format")

    parser.add_argument(
        "filepath", type=str, help="Usage: python3 main.py </path/to/file/>")
    parser.add_argument(
        "--out", type=str, help="MAVlink filename", default=DEFAULT_FILE_NAME)
    parser.add_argument(
        "--version", type=str, help="MAVlink version", default=LATEST_VERSION)
    parser.add_argument(
        "--takeoff", type=str, help="Add takeoff at start of mavlink", default=False)

    return parser.parse_args()


"""
This class manages the .plan conversion by 
loading the .plan, initializing the mav object
and writing the formated mav object to a new file
"""
class Converter():
    def __init__(self, filepath, out, takeoff, version):
        self.filepath = filepath
        self.out = out
        self.takeoff = takeoff
        self.version = version
        self.plan = {}

    def main(self):
        self.verify_format()
        mav = Mav(self.plan, self.version, self.takeoff)
        if mav.file:
            self.write_to_disk(mav.file)
            print("Successfully converted {} to {}".format(self.filepath, self.out))
        else:
            print("Conversion Failed: The input .plan was missing required navigation waypoints.")

    def verify_format(self):
        """Verifies plan format"""
        # TODO: check if its a .plan, and that its not empty
        try:
            with open(self.filepath) as f:
                self.plan = json.load(f)
                f.close()
        except FileNotFoundError:
            logging.error("Can't open specified file")
        except:
            logging.error("Unexpected error")

    def write_to_disk(self, mav):
        """Write mavlink object to file"""
        try:
            with open(self.out, "w+") as f:
                for line in mav:
                    f.write(str(line))
                f.close()
        except:
            logging.exception(
                "Unexpected error, could not append MAVlink object to file")


"""
This class converts a JSON .plan file to a 
formated mavlink file
"""
class Mav():
    def __init__(self, plan, version, takeoff):
        self.plan = plan
        self.header = "QGC WPL {}".format(version)
        self.takeoff = takeoff
        # Convert the raw .plan file then validate the mission
        self.raw_items = self.convert()
        self.mission_items = self.set_current_wp(self.raw_items)
        
        # Only format if we actually have a valid mission
        if self.mission_items is not None:
            self.file = self.format_items()
        else:
            self.file = None

    def convert(self):
        """Convert plan to mavlink plaintext file format"""
        mav_items = []
        # Access the mission items from the QGC JSON structure
        plan_items = self.plan.get("mission", {}).get("items", [])

        # Standard MAVLink Navigation Commands
        NAV_COMMANDS = [16, 22, 21, 17, 18, 19] 

        for i, item in enumerate(plan_items):
            frame = item.get("frame", 3)
            command = item.get("command")
            params = item.get("params", [])
            auto_continue = 1 if item.get("autoContinue", True) else 0

            # --- SAFETY CHECK: Navigation Coordinates ---
            # Indices 4, 5, 6 in the params list are Lat, Lon, Alt
            if command in NAV_COMMANDS:
                if params[4] is None or params[5] is None or params[4] == 0:
                    logger.error(f"Item {i}: Nav command {command} has invalid coordinates. Aborting.")
                    continue 

            # Clean up parameters: Replace None with 0.0 and ensure float type
            parameters = [0.0 if p is None else float(p) for p in params]

            # We leave index [0] and 'current' [1] as placeholders
            # They will be overwritten in format_items to maintain sequence
            mav_item = [0, 0, frame, command, *parameters, auto_continue]
            mav_items.append(mav_item)

        return mav_items

    def set_current_wp(self, mission_items):
        """Finds and sets current waypoint flag. Returns None if invalid."""
        has_waypoint = False
        flag = 0
        for item in mission_items:
            # Set the first takeoff as 'Current'
            if item[3] == TAKEOFF and flag == 0:
                item[1] = 1
                flag = 1
            
            # Check if at least one waypoint exists
            if item[3] == WAYPOINT:
                has_waypoint = True

        if not has_waypoint:
            logging.error("No WAYPOINT detected! Mission is invalid for Anafi AI.")
            return None # <--- This is your Killswitch

        return mission_items

    def format_items(self):
        mav_file = [self.header]
        current_index = 0
        
        if self.takeoff:
            # Takeoff is ALWAYS Index 0 if injected
            takeoff_cmd = [current_index, 1, 3, TAKEOFF, 0, 0, 0, 0, 0, 0, 0, 1]
            mav_file.append("\n" + "\t".join(map(str, takeoff_cmd)))
            current_index += 1

        for item in self.mission_items:
            # Override the index from the .plan to ensure it follows your injected takeoff
            item[0] = current_index 
            # Only the very first item in the file should be 'Current' (1)
            item[1] = 1 if current_index == 0 else 0 
            
            mav_file.append("\n" + "\t".join(map(str, item)))
            current_index += 1

        return mav_file

    def insert_tabs(self, target):
        """Insert tab between every item in target"""

        return"\t".join(str(t) for t in target)


if __name__ == "__main__":
    args = parse_args()

    converter = Converter(args.filepath, args.out, args.takeoff, args.version)
    converter.main()
