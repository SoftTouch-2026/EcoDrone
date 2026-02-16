/**
 * EcoDrone API Service Layer
 * All communication with the Flask backend goes through here.
 * The Vite dev server proxies /api to http://localhost:5001.
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================================
// DRONE COMMANDS
// ============================================================

/** Get drone status */
export function getStatus() {
    return request('/status');
}

/** Connect to drone */
export function connectDrone() {
    return request('/connect', { method: 'POST' });
}

/** Disconnect from drone */
export function disconnectDrone() {
    return request('/disconnect', { method: 'POST' });
}

/** Command takeoff */
export function takeoff() {
    return request('/takeoff', { method: 'POST' });
}

/** Command landing */
export function land() {
    return request('/land', { method: 'POST' });
}

/** Navigate to GPS coordinates */
export function navigate(latitude, longitude, altitude = 10) {
    return request('/navigate', {
        method: 'POST',
        body: JSON.stringify({ latitude, longitude, altitude }),
    });
}

/** Relative movement */
export function moveBy(forward, right, up, rotation = 0) {
    return request('/move', {
        method: 'POST',
        body: JSON.stringify({ forward, right, up, rotation }),
    });
}

/** Get battery level */
export function getBattery() {
    return request('/battery');
}

/** Health check */
export function getHealth() {
    return request('/health');
}
