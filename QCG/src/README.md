# Convert and Upload MAVlink ⚡️

This folder contains Python scripts that can convert QGC JSON .plan file to .mavlink file and upload it to an ANAFI AI drone.

## Folder Structure 🗃️
```
└── Src
    ├── README.md               This README
    ├── convert.py              Converts JSON .plan to .mavlink
    ├── config.py               Constants used by convert.py
    └── upload.py               Uploads .mavlink to drone and starts it    
```

## Setup ⚙️

Clone the project and navigate to the /src folder
```
git clone https://github.com/mgr098/qgc-mavlink-converter.git
cd src
```

## Convert .plan to .malink ♻️

In your terminal run
```
python3 convert.py /path/to/qgc.plan
```

<details>
<summary> View argument help </summary>
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

## Upload .mavlink to ANAFI AI drone ✈️

### Prerequisites ✔

* [Parrot Sphinx](https://developer.parrot.com/docs/sphinx/)

### Usage 🖥

To upload the .mavlink file to the drone and start the mission, run this in your terminal
```
python3 upload.py output.mavlink
```



