# Delivery Locations

Here is the list of all delivery locations with programming-friendly field names (`name`, `latitude`, `longitude`, `absolute_altitude`) extracted from the GPS data.

## JSON Format
This JSON array is directly usable in the cloud backend for seeding the database or use as configuration.

```json
[
  {
    "name": "Archer Cornfield Lower",
    "latitude": 5.759765224999998,
    "longitude": -0.220046349999447,
    "absolute_altitude": 354.7980041503906
  },
  {
    "name": "Archer Cornfield Upper",
    "latitude": 5.759706599999595,
    "longitude": -0.21993844499989734,
    "absolute_altitude": 355.8009948730469
  },
  {
    "name": "CS Department",
    "latitude": 5.7595037799990365,
    "longitude": -0.21953943500055573,
    "absolute_altitude": 356.0669860839844
  },
  {
    "name": "Cafeteria",
    "latitude": 5.758543319994385,
    "longitude": -0.21985313000163842,
    "absolute_altitude": 361.5530090332031
  },
  {
    "name": "Hostels Generator",
    "latitude": 5.758129449971031,
    "longitude": -0.22017107999947996,
    "absolute_altitude": 359.36700439453125
  },
  {
    "name": "Hostel-2E Rooftop",
    "latitude": 5.757190170016988,
    "longitude": -0.22101232998781767,
    "absolute_altitude": 351.3909912109375
  },
  {
    "name": "Hostel-2D Rooftop",
    "latitude": 5.7575989699940315,
    "longitude": -0.22124015000929376,
    "absolute_altitude": 346.1929931640625
  },
  {
    "name": "Hostel-KT Rooftop",
    "latitude": 5.758115784999068,
    "longitude": -0.22114700997528586,
    "absolute_altitude": 344.239990234375
  },
  {
    "name": "Munchies - Student Car Park",
    "latitude": 5.758773105004581,
    "longitude": -0.2211355499960092,
    "absolute_altitude": 339.6319885253906
  }
]
```

## Table Format

| name | latitude | longitude | absolute_altitude |
| :--- | :--- | :--- | :--- |
| Archer Cornfield Lower | 5.759765224999998 | -0.220046349999447 | 354.7980041503906 |
| Archer Cornfield Upper | 5.759706599999595 | -0.21993844499989734 | 355.8009948730469 |
| CS Department | 5.7595037799990365 | -0.21953943500055573 | 356.0669860839844 |
| Cafeteria | 5.758543319994385 | -0.21985313000163842 | 361.5530090332031 |
| Hostels Generator | 5.758129449971031 | -0.22017107999947996 | 359.36700439453125 |
| Hostel-2E Rooftop | 5.757190170016988 | -0.22101232998781767 | 351.3909912109375 |
| Hostel-2D Rooftop | 5.7575989699940315 | -0.22124015000929376 | 346.1929931640625 |
| Hostel-KT Rooftop | 5.758115784999068 | -0.22114700997528586 | 344.239990234375 |
| Munchies - Student Car Park | 5.758773105004581 | -0.2211355499960092 | 339.6319885253906 |
