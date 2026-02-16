/**
 * Campus reference data for the EcoDrone system.
 * Ashesi University campus buildings and geofence boundaries.
 */

export const CAMPUS_BUILDINGS = [
    { name: 'Main Kitchen', lat: 5.7596, lng: -0.2234 },
    { name: 'Engineering Block', lat: 5.7610, lng: -0.2250 },
    { name: 'Cafeteria', lat: 5.7592, lng: -0.2238 },
    { name: 'Dorm Block C', lat: 5.7605, lng: -0.2245 },
    { name: 'Library', lat: 5.7600, lng: -0.2230 },
    { name: 'Admin Building', lat: 5.7598, lng: -0.2220 },
];

export const GEOFENCE = {
    minLat: 5.7570,
    maxLat: 5.7620,
    minLng: -0.2260,
    maxLng: -0.2210,
};

export const GROUND_STATION_ID = 'GS-001';
