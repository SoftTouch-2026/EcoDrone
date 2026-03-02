# QGroundControl Plan to MAVlink Converter ♻️
Convert [QGroundControl (QGC)](http://qgroundcontrol.com/) JSON [.plan file](https://dev.qgroundcontrol.com/master/en/file_formats/plan.html) to [Parrot compatible MAVlink](https://developer.parrot.com/docs/mavlink-flightplan/overview.html) file used for [AirSDK Flight missions](https://developer.parrot.com/docs/airsdk/general/overview.html). 

## Requirements ✔

* [Python 3](https://www.python.org/)

## Setup ⚙️

Clone the project and navigate to the /src folder
```
git clone https://github.com/mgr098/qgc-mavlink-converter.git
cd qgc-mavlink-converter/src
```

If you haven't created a qgc plan do so with [QGroundControl](http://qgroundcontrol.com/).

## Usage 🖥


In your terminal run

```
python3 convert.py /path/to/qgc.plan
```

This converts your qgc.plan to a mavlink plan.

<details>
<summary> View optional arguments </summary>
<br>

```
python3 convert.py --help
```
Output
```
usage: convert.py [-h] [--out OUT] [--version VERSION]
               [--takeoff TAKEOFF]
               filepath

Convert QGC .plan to .mavlink format

positional arguments:
  filepath           Usage: python3 convert.py </path/to/file/>

optional arguments:
  -h, --help         show this help message and exit
  --out OUT          MAVlink filename
  --version VERSION  MAVlink version
  --takeoff TAKEOFF  Add takeoff at start of mavlink
```
Example usecase of optional arguments

```
python3 convert.py qgc.plan --out output.mavlink --version 120 --takeoff True
```
</details>

## Limitations 🚨

The converter does not support conversion of item type "complexItem" because it does not have a MAVlink standard. This means that the converter can't convert qgc plans containing: geofence, rally points, parameters etc. There is a discussion about standardising file formats in [Issue #989](https://github.com/mavlink/mavlink/issues/989) and I've opened up an an issue to support the conversion in [Issue #10342](https://github.com/mavlink/qgroundcontrol/issues/10342#issuecomment-1182683176).

It seems like GroundSDK flightplans also require a Mavlink WAYPOINT item in order to run. The converter will therefore give a warning if this is not included. However, TAKEOFF is not required.

## About 📝

This project was created in order to upload QGC plans to the ANAFI AI drone. It also contains a script that uploads and starts an AirSDK mission on a Parrot drone using a mavlink file. Read the [documentation](./src/README.md) on how to to run both scripts. 

If you want to learn how to use Mavlink Flightplans on a real mission, check out the [ANAFI Ai Survival Kit](https://github.com/mgr098/anafi-ai-survival-kit). This project contains scripts and guides that can help you when you're testing in the field.
