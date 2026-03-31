import sys
import json
import logging
import argparse
import os


# Set up logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


# Parses input arguments
def parse_args():
    """Parses input arguments."""
    parser = argparse.ArgumentParser(
        description="Extract GPS coordinates from QGC .plan files.")

    parser.add_argument(
        "path", type=str, help="Path to a QGC .plan file or a directory containing .plan files.")
    
    parser.add_argument(
        "--out", type=str, help="Output directory for JSON files", default="GPS JSONs")

    return parser.parse_args()


def extract_gps_coordinates(plan_filepath):
    """
    Loads a QGC .plan file and extracts all GPS coordinates.
    """
    try:
        with open(plan_filepath) as f:
            qgc_plan = json.load(f)
    except FileNotFoundError:
        logger.error(f"Error: Input file not found at '{plan_filepath}'")
        return None
    except json.JSONDecodeError:
        logger.error(f"Error: Could not decode JSON from '{plan_filepath}'. Make sure it is a valid JSON file.")
        return None

    if qgc_plan.get("fileType") != "Plan":
        logger.warning("Warning: File may not be a valid QGroundControl .plan file.")

    coordinates = {"homePosition": None, "missionItems": []}
    
    mission = qgc_plan.get("mission", {})

    # Extract planned home position
    home_pos = mission.get("plannedHomePosition")
    if home_pos and len(home_pos) >= 3:
        coordinates["homePosition"] = {
            "lat": home_pos[0],
            "lon": home_pos[1],
            "alt": home_pos[2]
        }
    
    # Navigation commands that contain GPS coordinates at params[4,5,6]
    # MAV_CMD_NAV_WAYPOINT, MAV_CMD_NAV_LOITER_UNLIM, MAV_CMD_NAV_LOITER_TURNS,
    # MAV_CMD_NAV_LOITER_TIME, MAV_CMD_NAV_LAND, MAV_CMD_NAV_TAKEOFF
    NAV_COMMANDS_WITH_COORDS = [16, 17, 18, 19, 21, 22]

    items = mission.get("items", [])
    for i, item in enumerate(items):
        command = item.get("command")
        params = item.get("params")

        if command in NAV_COMMANDS_WITH_COORDS:
            # params[4] = lat, params[5] = lon, params[6] = alt
            if params and len(params) >= 7 and params[4] is not None and params[5] is not None:
                coords = {
                    "item": i,
                    "command": command,
                    "lat": params[4],
                    "lon": params[5],
                    "alt": params[6] if params[6] is not None else 0.0
                }
                coordinates["missionItems"].append(coords)
            else:
                logger.warning(f"Skipping item {i} (command {command}) due to missing or invalid coordinates.")

    return coordinates


def process_file(plan_filepath, output_dir):
    """Processes a single .plan file."""
    if not plan_filepath.lower().endswith(".plan"):
        logger.error(f"Input file is not a .plan file: '{plan_filepath}'")
        return

    logger.info(f"Processing file: {plan_filepath}")
    gps_data = extract_gps_coordinates(plan_filepath)
    if gps_data:
        base_filename = os.path.basename(plan_filepath)
        output_filename = os.path.splitext(base_filename)[0] + ".json"
        output_filepath = os.path.join(output_dir, output_filename)
        write_to_disk(gps_data, output_filepath)

def process_directory(input_dir, output_dir):
    """Processes all .plan files in a directory."""
    logger.info(f"Scanning directory '{input_dir}' for .plan files...")
    plan_files = [f for f in os.listdir(input_dir) if f.lower().endswith(".plan")]
    if not plan_files:
        logger.warning(f"No .plan files found in '{input_dir}'.")
        return
    for filename in plan_files:
        file_path = os.path.join(input_dir, filename)
        process_file(file_path, output_dir)
    logger.info(f"Finished processing directory. Converted {len(plan_files)} file(s).")



def write_to_disk(data, output_filepath):
    """Writes the extracted coordinates to a JSON file."""
    try:
        with open(output_filepath, "w") as f:
            json.dump(data, f, indent=4)
        logger.info(f"Successfully wrote GPS coordinates to '{output_filepath}'")
    except IOError as e:
        logger.error(f"Error writing to output file '{output_filepath}': {e}")

def main():
    """Main execution function."""
    args = parse_args()
    input_path = args.path
    output_dir = args.out

    if not os.path.exists(input_path):
        logger.error(f"Error: Input path does not exist: '{input_path}'")
        return

    os.makedirs(output_dir, exist_ok=True)

    if os.path.isdir(input_path):
        process_directory(input_path, output_dir)
    elif os.path.isfile(input_path):
        process_file(input_path, output_dir)
    else:
        logger.error(f"Input path '{input_path}' is not a valid file or directory.")



if __name__ == "__main__":
    main()
