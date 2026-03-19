import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

// ============================================================
// CONFIGURATION
// ============================================================
const API_BASE_URL = 'http://localhost:5001'; // Ground Station API
const GROUND_STATION_ID = 'GS-001';

// ============================================================
// COMPONENTS
// ============================================================

// Safety Checklist Component
const SafetyChecklist = ({ mission }: any) => {
    const checks = mission?.safety_checklist || {};

    const checkItems = [
        { key: 'battery_sufficient', label: 'Battery Level Sufficient', icon: '⚡' },
        { key: 'within_geofence', label: 'Route Within Geofence', icon: '◎' },
        { key: 'weather_acceptable', label: 'Weather Conditions OK', icon: '○' },
        { key: 'no_airspace_conflicts', label: 'No Airspace Conflicts', icon: '△' },
        { key: 'payload_acceptable', label: 'Payload Within Limits', icon: '□' },
    ];

    const allClear = checkItems.every(item => checks[item.key as keyof typeof checks]);

    return (
        <div className="spacex-card p-6">
            <h3 className="spacex-label mb-4 flex items-center gap-2">
                <span className="text-base">◆</span>
                Safety Checklist
            </h3>
            <div className="space-y-0">
                {checkItems.map(item => (
                    <div
                        key={item.key}
                        className="spacex-data-row flex items-center gap-3"
                    >
                        <span className="text-spacex-white-50 text-sm">{item.icon}</span>
                        <span className="flex-1 text-sm text-spacex-white-80">
                            {item.label}
                        </span>
                        <span className={`text-sm font-medium ${checks[item.key as keyof typeof checks] ? 'text-spacex-white' : 'text-spacex-white-40'
                            }`}>
                            {checks[item.key as keyof typeof checks] ? '✓ PASS' : '✗ FAIL'}
                        </span>
                    </div>
                ))}
            </div>

            <div className={`mt-4 py-3 text-center border ${allClear
                ? 'border-spacex-white-30 text-spacex-white'
                : 'border-spacex-white-15 text-spacex-white-50'
                }`}>
                <p className="text-sm font-medium uppercase tracking-wider">
                    {allClear ? '✓ All safety checks passed' : '△ Safety concerns detected'}
                </p>
            </div>
        </div>
    );
};

// Mission Details Card
const MissionDetailsCard = ({ mission }: any) => {
    if (!mission) return null;

    return (
        <div className="spacex-card p-6">
            <h3 className="spacex-label mb-4 flex items-center gap-2">
                <span className="text-base">≡</span>
                Mission Details
            </h3>

            <div>
                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">Mission ID</span>
                    <span className="text-spacex-white font-mono text-sm">{mission.mission_id}</span>
                </div>

                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">Priority</span>
                    <span className="text-spacex-white text-sm font-medium uppercase">
                        {mission.priority >= 4 ? 'HIGH' :
                            mission.priority >= 3 ? 'NORMAL' :
                                'LOW'}
                    </span>
                </div>

                <div className="spacex-data-row">
                    <div className="flex items-center justify-between">
                        <span className="spacex-label">◎ Pickup Location</span>
                    </div>
                    <div className="text-spacex-white text-sm mt-1">{mission.pickup_location.name || 'Main Kitchen'}</div>
                    <div className="text-spacex-white-40 text-xs font-mono mt-0.5">
                        {mission.pickup_location.latitude.toFixed(4)}, {mission.pickup_location.longitude.toFixed(4)}
                    </div>
                </div>

                <div className="spacex-data-row">
                    <div className="flex items-center justify-between">
                        <span className="spacex-label">◎ Delivery Location</span>
                    </div>
                    <div className="text-spacex-white text-sm mt-1">{mission.delivery_location.name || 'Student Dorm'}</div>
                    <div className="text-spacex-white-40 text-xs font-mono mt-0.5">
                        {mission.delivery_location.latitude.toFixed(4)}, {mission.delivery_location.longitude.toFixed(4)}
                    </div>
                </div>

                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">Distance</span>
                    <span className="text-spacex-white text-sm">{mission.distance_meters || '450'}m</span>
                </div>

                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">Est. Flight Time</span>
                    <span className="text-spacex-white text-sm">{mission.estimated_flight_time || '4'} min</span>
                </div>

                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">Payload</span>
                    <span className="text-spacex-white text-sm">{mission.payload_weight_grams}g</span>
                </div>

                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">Battery Required</span>
                    <span className="text-spacex-white text-sm">~{mission.battery_required || '25'}%</span>
                </div>
            </div>

            {mission.special_instructions && (
                <div className="mt-4 border border-spacex-white-15 p-3">
                    <div className="spacex-label mb-1">▸ Special Instructions</div>
                    <div className="text-spacex-white-70 text-sm">{mission.special_instructions}</div>
                </div>
            )}
        </div>
    );
};

// Drone Status Widget
const DroneStatusWidget = ({ drone }: any) => {
    return (
        <div className="spacex-card p-6">
            <h3 className="spacex-label mb-4 flex items-center gap-2">
                <span className="text-base">▣</span>
                Drone Status
            </h3>

            <div>
                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">Drone ID</span>
                    <span className="text-spacex-white font-mono text-sm">{drone.drone_id}</span>
                </div>

                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">Battery</span>
                    <span className="text-spacex-white text-sm font-medium">
                        {drone.battery_level}%
                    </span>
                </div>

                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">GPS Lock</span>
                    <span className="text-spacex-white text-sm">
                        ✓ {drone.gps_satellites || 12} satellites
                    </span>
                </div>

                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">Signal</span>
                    <span className="text-spacex-white text-sm">
                        {drone.signal_strength || 'Excellent'}
                    </span>
                </div>

                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">Status</span>
                    <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider border border-spacex-white-30 text-spacex-white">
                        {drone.status}
                    </span>
                </div>
            </div>
        </div>
    );
};

// Mission Queue Item
const QueuedMissionItem = ({ mission, index }: any) => (
    <div className="spacex-card-subtle p-4">
        <div className="flex items-center justify-between mb-2">
            <span className="spacex-label">#{index + 1} in Queue</span>
            <span className="text-spacex-white-40 font-mono text-xs">{mission.mission_id}</span>
        </div>
        <div className="text-spacex-white font-medium text-sm mb-1">
            {mission.pickup_location.name} → {mission.delivery_location.name}
        </div>
        <div className="flex items-center gap-3 text-xs text-spacex-white-50">
            <span>{mission.payload_weight_grams}g</span>
            <span>·</span>
            <span>~{mission.estimated_flight_time}m</span>
            <span>·</span>
            <span>Priority: {mission.priority}</span>
        </div>
    </div>
);

// ============================================================
// FLIGHT COMMAND PAGE COMPONENT
// ============================================================

// Campus reference data
const CAMPUS_BUILDINGS = [
    { name: 'Main Kitchen', lat: 5.7596, lng: -0.2234 },
    { name: 'Engineering Block', lat: 5.7610, lng: -0.2250 },
    { name: 'Cafeteria', lat: 5.7592, lng: -0.2238 },
    { name: 'Dorm Block C', lat: 5.7605, lng: -0.2245 },
    { name: 'Library', lat: 5.7600, lng: -0.2230 },
    { name: 'Admin Building', lat: 5.7598, lng: -0.2220 },
];

const GEOFENCE = {
    minLat: 5.7570, maxLat: 5.7620,
    minLng: -0.2260, maxLng: -0.2210,
};

const FlightCommandPage = ({ drone, addLog }: any) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [source, setSource] = useState<{lat: number, lng: number} | null>(null);
    const [destination, setDestination] = useState<{lat: number, lng: number} | null>(null);
    const [clickMode, setClickMode] = useState('source'); // 'source' or 'destination'
    const [altitude, setAltitude] = useState(10);
    const [speed, setSpeed] = useState(5);
    const [commandLog, setCommandLog] = useState<any[]>([]);
    const [manualSource, setManualSource] = useState({ lat: '', lng: '' });
    const [manualDest, setManualDest] = useState({ lat: '', lng: '' });

    // Convert GPS to canvas pixel coordinates
    const gpsToCanvas = (lat: number, lng: number, canvas: any) => {
        const padding = 60;
        const w = canvas.width - padding * 2;
        const h = canvas.height - padding * 2;
        const x = padding + ((lng - GEOFENCE.minLng) / (GEOFENCE.maxLng - GEOFENCE.minLng)) * w;
        const y = padding + ((GEOFENCE.maxLat - lat) / (GEOFENCE.maxLat - GEOFENCE.minLat)) * h;
        return { x, y };
    };

    // Calculate distance between two GPS points (Haversine)
    const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371000;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    };

    // Draw the canvas map
    const drawMap = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;

        // Set canvas size to fill container
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        // Use CSS dimensions for drawing calculations
        const drawW = rect.width;
        const drawH = rect.height;
        const padding = 60;

        // Background
        ctx.fillStyle = 'rgba(10, 10, 15, 1)';
        ctx.fillRect(0, 0, drawW, drawH);

        // Grid lines
        const gridCountX = 10;
        const gridCountY = 10;
        ctx.strokeStyle = 'rgba(240, 240, 250, 0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= gridCountX; i++) {
            const x = padding + (i / gridCountX) * (drawW - padding * 2);
            ctx.beginPath(); ctx.moveTo(x, padding); ctx.lineTo(x, drawH - padding); ctx.stroke();
        }
        for (let i = 0; i <= gridCountY; i++) {
            const y = padding + (i / gridCountY) * (drawH - padding * 2);
            ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(drawW - padding, y); ctx.stroke();
        }

        // Axis labels
        ctx.fillStyle = 'rgba(240, 240, 250, 0.35)';
        ctx.font = '10px Inter, monospace';
        ctx.textAlign = 'center';
        for (let i = 0; i <= 5; i++) {
            const lng = GEOFENCE.minLng + (i / 5) * (GEOFENCE.maxLng - GEOFENCE.minLng);
            const x = padding + (i / 5) * (drawW - padding * 2);
            ctx.fillText(lng.toFixed(4), x, drawH - padding + 20);
        }
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const lat = GEOFENCE.maxLat - (i / 5) * (GEOFENCE.maxLat - GEOFENCE.minLat);
            const y = padding + (i / 5) * (drawH - padding * 2);
            ctx.fillText(lat.toFixed(4), padding - 8, y + 4);
        }

        // Axis titles
        ctx.fillStyle = 'rgba(240, 240, 250, 0.25)';
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LONGITUDE', drawW / 2, drawH - padding + 40);
        ctx.save();
        ctx.translate(15, drawH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('LATITUDE', 0, 0);
        ctx.restore();

        // Use manual calculation for geofence
        const gfX = padding;
        const gfY = padding;
        const gfW = drawW - padding * 2;
        const gfH = drawH - padding * 2;
        ctx.strokeStyle = 'rgba(240, 240, 250, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(gfX, gfY, gfW, gfH);
        ctx.setLineDash([]);

        // Geofence label
        ctx.fillStyle = 'rgba(240, 240, 250, 0.2)';
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('GEOFENCE BOUNDARY', gfX + 4, gfY - 6);

        // Helper for GPS to canvas using CSS dimensions
        const toCanvas = (lat: number, lng: number) => {
            const x = padding + ((lng - GEOFENCE.minLng) / (GEOFENCE.maxLng - GEOFENCE.minLng)) * (drawW - padding * 2);
            const y = padding + ((GEOFENCE.maxLat - lat) / (GEOFENCE.maxLat - GEOFENCE.minLat)) * (drawH - padding * 2);
            return { x, y };
        };

        // Draw buildings
        CAMPUS_BUILDINGS.forEach(b => {
            const { x, y } = toCanvas(b.lat, b.lng);
            // Building marker
            ctx.fillStyle = 'rgba(240, 240, 250, 0.12)';
            ctx.fillRect(x - 16, y - 10, 32, 20);
            ctx.strokeStyle = 'rgba(240, 240, 250, 0.25)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x - 16, y - 10, 32, 20);
            // Label
            ctx.fillStyle = 'rgba(240, 240, 250, 0.5)';
            ctx.font = '9px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(b.name.toUpperCase(), x, y - 16);
            // Dot
            ctx.fillStyle = 'rgba(240, 240, 250, 0.4)';
            ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        });

        // Draw flight path
        if (source && destination) {
            const s = toCanvas(source.lat, source.lng);
            const d = toCanvas(destination.lat, destination.lng);
            ctx.strokeStyle = 'rgba(240, 240, 250, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([8, 6]);
            ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(d.x, d.y); ctx.stroke();
            ctx.setLineDash([]);

            // Distance label at midpoint
            const mx = (s.x + d.x) / 2;
            const my = (s.y + d.y) / 2;
            const dist = calcDistance(source.lat, source.lng, destination.lat, destination.lng);
            ctx.fillStyle = 'rgba(10, 10, 15, 0.85)';
            ctx.fillRect(mx - 30, my - 10, 60, 18);
            ctx.fillStyle = 'rgba(240, 240, 250, 0.7)';
            ctx.font = '10px Inter, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${dist}m`, mx, my + 3);
        }

        // Draw source marker
        if (source) {
            const { x, y } = toCanvas(source.lat, source.lng);
            // Outer ring
            ctx.strokeStyle = 'rgba(240, 240, 250, 0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.stroke();
            // Inner dot
            ctx.fillStyle = 'rgba(240, 240, 250, 0.9)';
            ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
            // Label
            ctx.fillStyle = 'rgba(240, 240, 250, 0.8)';
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('SOURCE', x + 15, y - 2);
            ctx.font = '9px Inter, monospace';
            ctx.fillStyle = 'rgba(240, 240, 250, 0.5)';
            ctx.fillText(`${source.lat}, ${source.lng}`, x + 15, y + 11);
        }

        // Draw destination marker
        if (destination) {
            const { x, y } = toCanvas(destination.lat, destination.lng);
            // Diamond shape
            ctx.fillStyle = 'rgba(240, 240, 250, 0.9)';
            ctx.beginPath();
            ctx.moveTo(x, y - 10); ctx.lineTo(x + 8, y); ctx.lineTo(x, y + 10); ctx.lineTo(x - 8, y);
            ctx.closePath(); ctx.fill();
            // Inner cutout
            ctx.fillStyle = 'rgba(10, 10, 15, 1)';
            ctx.beginPath();
            ctx.moveTo(x, y - 5); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 5); ctx.lineTo(x - 4, y);
            ctx.closePath(); ctx.fill();
            // Label
            ctx.fillStyle = 'rgba(240, 240, 250, 0.8)';
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('DESTINATION', x + 15, y - 2);
            ctx.font = '9px Inter, monospace';
            ctx.fillStyle = 'rgba(240, 240, 250, 0.5)';
            ctx.fillText(`${destination.lat}, ${destination.lng}`, x + 15, y + 11);
        }

        // Click mode indicator
        ctx.fillStyle = 'rgba(240, 240, 250, 0.3)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`CLICK TO SET: ${clickMode.toUpperCase()}`, drawW - padding, padding - 8);

    }, [source, destination, clickMode]);

    // Redraw on state change and resize
    // Redraw on state change and resize
    useEffect(() => {
        drawMap();

        // Force redraw after a short delay to ensure canvas has correct dimensions from CSS
        // This fixes the initial "crowded" render if the browser hasn't finished layout
        const timer = setTimeout(drawMap, 50);

        const handleResize = () => drawMap();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, [drawMap]);

    // Handle map click
    const handleCanvasClick = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const padding = 60;
        const drawW = rect.width;
        const drawH = rect.height;

        // Only register clicks inside the geofence area
        if (px < padding || px > drawW - padding || py < padding || py > drawH - padding) return;

        const lng = GEOFENCE.minLng + ((px - padding) / (drawW - padding * 2)) * (GEOFENCE.maxLng - GEOFENCE.minLng);
        const lat = GEOFENCE.maxLat - ((py - padding) / (drawH - padding * 2)) * (GEOFENCE.maxLat - GEOFENCE.minLat);
        const coords = { lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000 };

        if (clickMode === 'source') {
            setSource(coords);
            setManualSource({ lat: coords.lat.toString(), lng: coords.lng.toString() });
            setClickMode('destination');
        } else {
            setDestination(coords);
            setManualDest({ lat: coords.lat.toString(), lng: coords.lng.toString() });
            setClickMode('source');
        }
    };

    // Handle manual coordinate input
    const applyManualCoords = (type: string) => {
        const manual = type === 'source' ? manualSource : manualDest;
        const lat = parseFloat(manual.lat);
        const lng = parseFloat(manual.lng);
        if (isNaN(lat) || isNaN(lng)) return;
        const coords = { lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000 };
        if (type === 'source') setSource(coords);
        else setDestination(coords);
    };

    // Quick-pick building
    const quickPick = (building: any, type: string) => {
        const coords = { lat: building.lat, lng: building.lng };
        if (type === 'source') {
            setSource(coords);
            setManualSource({ lat: coords.lat.toString(), lng: coords.lng.toString() });
        } else {
            setDestination(coords);
            setManualDest({ lat: coords.lat.toString(), lng: coords.lng.toString() });
        }
    };

    // Send flight command
    const sendCommand = async () => {
        if (!source || !destination) return;
        const dist = calcDistance(source.lat, source.lng, destination.lat, destination.lng);
        const cmd = {
            id: `CMD-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            source,
            destination,
            altitude,
            speed,
            distance: dist,
        };
        setCommandLog(prev => [cmd, ...prev.slice(0, 19)]);
        
        try {
            await fetch(`${API_BASE_URL}/api/delivery/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ waypoints: [[destination.lat, destination.lng]] })
            });
            if (addLog) addLog(`Flight command sent: ${source.lat},${source.lng} → ${destination.lat},${destination.lng} | Alt: ${altitude}m | Spd: ${speed}m/s | Dist: ${dist}m`, 'success');
        } catch(e) {
            console.error(e);
            if(addLog) addLog("Failed to send flight command", 'error');
        }
    };

    // Clear all
    const clearAll = () => {
        setSource(null);
        setDestination(null);
        setManualSource({ lat: '', lng: '' });
        setManualDest({ lat: '', lng: '' });
        setClickMode('source');
    };

    const distance = source && destination ? calcDistance(source.lat, source.lng, destination.lat, destination.lng) : null;

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Panel */}
            <div className="lg:col-span-2 space-y-4">
                <div className="spacex-card p-0 overflow-hidden" style={{ height: '520px' }}>
                    <canvas
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        className="w-full h-full cursor-crosshair"
                        style={{ display: 'block' }}
                    />
                </div>

                {/* Map Legend */}
                <div className="spacex-card p-4 flex items-center gap-8 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-spacex-white-90 rounded-full"></span>
                        <span className="text-spacex-white-60">SOURCE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-spacex-white-90 text-sm">◆</span>
                        <span className="text-spacex-white-60">DESTINATION</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-6 border-t border-dashed border-spacex-white-50"></span>
                        <span className="text-spacex-white-60">FLIGHT PATH</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-4 h-3 border border-spacex-white-30 bg-spacex-white-10"></span>
                        <span className="text-spacex-white-60">BUILDING</span>
                    </div>
                    <div className="flex-1"></div>
                    <span className="text-spacex-white-30">CLICK MAP TO PLACE: {clickMode.toUpperCase()}</span>
                </div>
            </div>

            {/* Command Panel */}
            <div className="space-y-4">
                {/* Source Coordinates */}
                <div className="spacex-card p-5">
                    <h3 className="spacex-label text-spacex-white-70 mb-4 flex items-center gap-2">
                        <span className="text-base">◎</span> Source Coordinates
                    </h3>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-spacex-white-30 text-xs uppercase tracking-wider block mb-1">Latitude</label>
                                <input
                                    type="text"
                                    value={manualSource.lat}
                                    onChange={e => setManualSource(prev => ({ ...prev, lat: e.target.value }))}
                                    onBlur={() => applyManualCoords('source')}
                                    placeholder="5.7596"
                                    className="w-full bg-spacex-white-10 border border-spacex-white-15 text-spacex-white p-2 text-sm font-mono focus:outline-none focus:border-spacex-white-30"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-spacex-white-30 text-xs uppercase tracking-wider block mb-1">Longitude</label>
                                <input
                                    type="text"
                                    value={manualSource.lng}
                                    onChange={e => setManualSource(prev => ({ ...prev, lng: e.target.value }))}
                                    onBlur={() => applyManualCoords('source')}
                                    placeholder="-0.2234"
                                    className="w-full bg-spacex-white-10 border border-spacex-white-15 text-spacex-white p-2 text-sm font-mono focus:outline-none focus:border-spacex-white-30"
                                />
                            </div>
                        </div>
                        <select
                            onChange={e => { const b = CAMPUS_BUILDINGS.find(b => b.name === e.target.value); if (b) quickPick(b, 'source'); }}
                            value=""
                            className="w-full bg-spacex-white-10 border border-spacex-white-15 text-spacex-white-60 p-2 text-xs uppercase tracking-wider focus:outline-none cursor-pointer"
                        >
                            <option value="">Quick Pick Building...</option>
                            {CAMPUS_BUILDINGS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Destination Coordinates */}
                <div className="spacex-card p-5">
                    <h3 className="spacex-label text-spacex-white-70 mb-4 flex items-center gap-2">
                        <span className="text-base">◆</span> Destination Coordinates
                    </h3>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-spacex-white-30 text-xs uppercase tracking-wider block mb-1">Latitude</label>
                                <input
                                    type="text"
                                    value={manualDest.lat}
                                    onChange={e => setManualDest(prev => ({ ...prev, lat: e.target.value }))}
                                    onBlur={() => applyManualCoords('destination')}
                                    placeholder="5.7610"
                                    className="w-full bg-spacex-white-10 border border-spacex-white-15 text-spacex-white p-2 text-sm font-mono focus:outline-none focus:border-spacex-white-30"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-spacex-white-30 text-xs uppercase tracking-wider block mb-1">Longitude</label>
                                <input
                                    type="text"
                                    value={manualDest.lng}
                                    onChange={e => setManualDest(prev => ({ ...prev, lng: e.target.value }))}
                                    onBlur={() => applyManualCoords('destination')}
                                    placeholder="-0.2250"
                                    className="w-full bg-spacex-white-10 border border-spacex-white-15 text-spacex-white p-2 text-sm font-mono focus:outline-none focus:border-spacex-white-30"
                                />
                            </div>
                        </div>
                        <select
                            onChange={e => { const b = CAMPUS_BUILDINGS.find(b => b.name === e.target.value); if (b) quickPick(b, 'destination'); }}
                            value=""
                            className="w-full bg-spacex-white-10 border border-spacex-white-15 text-spacex-white-60 p-2 text-xs uppercase tracking-wider focus:outline-none cursor-pointer"
                        >
                            <option value="">Quick Pick Building...</option>
                            {CAMPUS_BUILDINGS.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Flight Parameters */}
                <div className="spacex-card p-5">
                    <h3 className="spacex-label text-spacex-white-70 mb-4 flex items-center gap-2">
                        <span className="text-base">▥</span> Flight Parameters
                    </h3>
                    <div className="space-y-3">
                        <div className="spacex-data-row">
                            <span className="text-spacex-white-50 text-sm">Altitude</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={altitude}
                                    onChange={e => setAltitude(parseInt(e.target.value) || 0)}
                                    min="2" max="120"
                                    className="w-20 bg-spacex-white-10 border border-spacex-white-15 text-spacex-white p-1.5 text-sm font-mono text-right focus:outline-none focus:border-spacex-white-30"
                                />
                                <span className="text-spacex-white-50 text-xs">m</span>
                            </div>
                        </div>
                        <div className="spacex-data-row">
                            <span className="text-spacex-white-50 text-sm">Speed</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={speed}
                                    onChange={e => setSpeed(parseInt(e.target.value) || 0)}
                                    min="1" max="15"
                                    className="w-20 bg-spacex-white-10 border border-spacex-white-15 text-spacex-white p-1.5 text-sm font-mono text-right focus:outline-none focus:border-spacex-white-30"
                                />
                                <span className="text-spacex-white-50 text-xs">m/s</span>
                            </div>
                        </div>
                        {distance !== null && (
                            <div className="spacex-data-row">
                                <span className="text-spacex-white-50 text-sm">Distance</span>
                                <span className="text-spacex-white font-mono text-sm">{distance}m</span>
                            </div>
                        )}
                        {distance !== null && (
                            <div className="spacex-data-row">
                                <span className="text-spacex-white-50 text-sm">Est. Flight Time</span>
                                <span className="text-spacex-white font-mono text-sm">{Math.ceil(distance / speed)}s</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={sendCommand}
                        disabled={!source || !destination}
                        className={`flex-1 py-3 font-medium text-sm uppercase tracking-wider transition-all ${source && destination
                            ? 'bg-spacex-white text-black hover:bg-spacex-white-90'
                            : 'bg-spacex-white-10 text-spacex-white-30 cursor-not-allowed'
                            }`}
                    >
                        ▸ Send Flight Command
                    </button>
                    <button
                        onClick={clearAll}
                        className="px-5 py-3 border border-spacex-white-15 text-spacex-white-60 hover:text-spacex-white hover:border-spacex-white-30 font-medium text-sm uppercase tracking-wider transition-all"
                    >
                        Clear
                    </button>
                </div>

                {/* Command Log */}
                <div className="spacex-card p-5">
                    <h3 className="spacex-label text-spacex-white-70 mb-3 flex items-center gap-2">
                        <span className="text-base">≡</span> Command Log
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto scrollable">
                        {commandLog.length === 0 ? (
                            <p className="text-spacex-white-30 text-xs text-center py-4">No commands sent yet</p>
                        ) : (
                            commandLog.map((cmd, i) => (
                                <div key={cmd.id} className="spacex-card-subtle p-3 text-xs space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-spacex-white-50 font-mono">{cmd.id}</span>
                                        <span className="text-spacex-white-30">{cmd.timestamp}</span>
                                    </div>
                                    <div className="text-spacex-white-70 font-mono">
                                        {cmd.source.lat}, {cmd.source.lng} → {cmd.destination.lat}, {cmd.destination.lng}
                                    </div>
                                    <div className="text-spacex-white-30">
                                        Alt: {cmd.altitude}m · Spd: {cmd.speed}m/s · Dist: {cmd.distance}m
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// MAIN APP COMPONENT
// ============================================================
function App() {
    // State
    const [activePage, setActivePage] = useState('missions');
    const [pendingMission, setPendingMission] = useState<any>(null);
    const [currentMission, setCurrentMission] = useState<any>(null);
    const [missionQueue, setMissionQueue] = useState<any[]>([]);
    const [stats, setStats] = useState({ completed: 12, queued: 3, rejected: 1, avgTime: 2.3 });
    const [drone, setDrone] = useState({
        drone_id: 'D-ANAFI-001',
        battery_level: 85,
        gps_satellites: 14,
        signal_strength: 'Excellent',
        status: 'AVAILABLE'
    });
    const [logs, setLogs] = useState<any[]>([]);
    const [operatorName, setOperatorName] = useState('Operator');

    // Audio notification
    const playNotification = () => {
        // Simple beep sound (you can replace with actual audio file)
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;

        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
    };

    const addLog = (message: string, level: string = 'info') => {
        setLogs(prev => [{
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message,
            level
        }, ...prev].slice(0, 50));
    };

    // Simulate incoming mission
    useEffect(() => {
        const timer = setTimeout(() => {
            const newMission = {
                mission_id: 'M-1048',
                priority: 4,
                pickup_location: { name: 'Cafeteria', latitude: 5.7592, longitude: -0.2238 },
                delivery_location: { name: 'Dorm Block C', latitude: 5.7605, longitude: -0.2245 },
                distance_meters: 210,
                estimated_flight_time: 1.5,
                payload_weight_grams: 850,
                battery_required: 15,
                special_instructions: 'Handle with care - Hot Food',
                safety_checklist: {
                    battery_sufficient: true,
                    within_geofence: true,
                    weather_acceptable: true,
                    no_airspace_conflicts: true,
                    payload_acceptable: true
                }
            };
            setPendingMission(newMission);
            playNotification();
            addLog(`Incoming Mission: ${newMission.mission_id}`, 'warning');
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleAccept = async () => {
        if (!pendingMission) return;
        setCurrentMission(pendingMission);
        setPendingMission(null);
        setDrone(prev => ({ ...prev, status: 'EN_ROUTE_PICKUP' }));
        addLog(`Mission ${pendingMission.mission_id} ACQUIRED. Modifying drone status.`);
    };

    const handleDecline = () => {
        if (!pendingMission) return;
        setStats(prev => ({ ...prev, rejected: prev.rejected + 1 }));
        addLog(`Mission ${pendingMission.mission_id} REJECTED.`, 'error');
        setPendingMission(null);
    };

    const abortMission = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/delivery/abort`, { method: 'POST' });
            setCurrentMission(null);
            setDrone(prev => ({ ...prev, status: 'ABORTED / MANUAL' }));
            addLog(`Mission ABORTED. Manual override engaged.`, 'error');
            playNotification();
        } catch(e) {
            console.error(e);
            addLog("Failed to abort mission", 'error');
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Nav Sidebar */}
            <div className="w-64 border-r border-spacex-white-15 bg-black flex flex-col pt-6 pb-4 shrink-0">
                <div className="px-6 mb-10">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-6 h-6 bg-spacex-white rounded-[1px] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-black translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight uppercase">EcoDrone</h1>
                    </div>
                    <p className="text-spacex-white-50 text-xs font-mono tracking-widest">{GROUND_STATION_ID}</p>
                </div>

                <div className="flex-1 flex flex-col gap-1 px-3">
                    <button
                        onClick={() => setActivePage('missions')}
                        className={`text-left px-4 py-3 rounded-sm text-sm uppercase tracking-wider font-medium transition-all ${activePage === 'missions'
                            ? 'bg-spacex-card border border-spacex-white-15 text-spacex-white'
                            : 'text-spacex-white-50 hover:text-spacex-white hover:bg-spacex-white-05 border border-transparent'
                            }`}
                    >
                        Missions
                    </button>
                    <button
                        onClick={() => setActivePage('flight')}
                        className={`text-left px-4 py-3 rounded-sm text-sm uppercase tracking-wider font-medium transition-all ${activePage === 'flight'
                            ? 'bg-spacex-card border border-spacex-white-15 text-spacex-white'
                            : 'text-spacex-white-50 hover:text-spacex-white hover:bg-spacex-white-05 border border-transparent'
                            }`}
                    >
                        Flight Commands
                    </button>
                    <button
                        onClick={() => setActivePage('camera')}
                        className={`text-left px-4 py-3 rounded-sm text-sm uppercase tracking-wider font-medium transition-all ${activePage === 'camera'
                            ? 'bg-spacex-card border border-spacex-white-15 text-spacex-white'
                            : 'text-spacex-white-50 hover:text-spacex-white hover:bg-spacex-white-05 border border-transparent'
                            }`}
                    >
                        Camera Feed
                    </button>
                </div>

                <div className="mt-auto px-6">
                    <div className="spacex-data-row border-t border-spacex-white-15 pt-4">
                        <div className="text-spacex-white-40 text-xs uppercase tracking-wider mb-1">Operator</div>
                        <div className="text-spacex-white text-sm font-medium">{operatorName}</div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full bg-[#050505] relative overflow-y-auto overflow-x-hidden">

                {/* Top Header Bar */}
                <div className="h-16 border-b border-spacex-white-15 bg-black/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
                    <h2 className="text-lg font-medium text-spacex-white-90 uppercase tracking-widest">
                        {activePage === 'missions' ? 'Mission Control' :
                            activePage === 'flight' ? 'Flight Commands' :
                                'Live Telemetry'}
                    </h2>
                    <div className="flex gap-6">
                        <div className="flex flex-col items-end">
                            <span className="spacex-label mb-0.5">Connection</span>
                            <span className="flex items-center gap-2 text-xs font-mono text-[#00ff9d]">
                                <span className="w-2 h-2 rounded-full bg-[#00ff9d] pulse-ring relative"></span>
                                CONNECTED
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-8 max-w-7xl mx-auto w-full">
                    {/* PAGE: MISSIONS */}
                    {activePage === 'missions' && (
                        <>
                            {/* Stats Overview */}
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: 'DELIVERIES COMPLETED', value: stats.completed },
                                    { label: 'IN QUEUE', value: stats.queued },
                                    { label: 'AVG DURATION (MIN)', value: stats.avgTime },
                                    { label: 'REJECTED MISSIONS', value: stats.rejected }
                                ].map((stat, i) => (
                                    <div key={i} className="spacex-card p-4">
                                        <div className="spacex-label mb-2">{stat.label}</div>
                                        <div className="text-2xl font-light text-spacex-white">{stat.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                                {/* Left Column: Mission Control */}
                                <div className="xl:col-span-2 space-y-6">

                                    {/* Critical Notification Area */}
                                    {pendingMission && !currentMission && (
                                        <div className="border border-[#00ff9d]/40 bg-[#00ff9d]/5 p-6 mission-notification relative overflow-hidden">
                                            {/* decorative accents */}
                                            <div className="absolute top-0 left-0 w-2 h-full bg-[#00ff9d]"></div>
                                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00ff9d]/30"></div>
                                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00ff9d]/30"></div>

                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <div className="text-[#00ff9d] text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-[#00ff9d] rounded-full animate-pulse"></span>
                                                        Action Required
                                                    </div>
                                                    <h3 className="text-xl font-medium text-spacex-white">New Mission Request: {pendingMission.mission_id}</h3>
                                                </div>
                                                <div className="text-right">
                                                    <div className="spacex-label">Priority</div>
                                                    <div className="text-[#00ff9d] font-bold">HIGH</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <button
                                                    onClick={handleAccept}
                                                    className="flex-1 bg-[#00ff9d] text-black font-medium py-3 px-6 uppercase tracking-wider text-sm hover:bg-[#00cc7a] transition-colors"
                                                >
                                                    Acquire Mission
                                                </button>
                                                <button
                                                    onClick={handleDecline}
                                                    className="flex-1 border border-spacex-white-30 text-spacex-white-80 hover:text-white hover:border-spacex-white py-3 px-6 uppercase tracking-wider text-sm font-medium transition-colors"
                                                >
                                                    Reject / Reroute
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Active Mission View */}
                                    {currentMission ? (
                                        <div className="fade-in">
                                            <div className="flex justify-between items-end mb-4">
                                                <h3 className="text-xl font-medium text-spacex-white">Active Operator Control</h3>
                                                <button
                                                    onClick={abortMission}
                                                    className="text-red-500 border border-red-500/50 hover:bg-red-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors"
                                                >
                                                    Abort / Hold
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <MissionDetailsCard mission={currentMission} />
                                                <div className="space-y-6">
                                                    <SafetyChecklist mission={currentMission} />
                                                    <div className="spacex-card p-6">
                                                        <h3 className="spacex-label mb-4">Current Objective</h3>
                                                        <div className="text-spacex-white font-medium mb-1">
                                                            Navigating to {currentMission.pickup_location.name}
                                                        </div>
                                                        <div className="w-full h-1 bg-spacex-white-10 mt-4 rounded-full overflow-hidden">
                                                            <div className="h-full bg-[#00ff9d] w-1/3"></div>
                                                        </div>
                                                        <div className="flex justify-between mt-2 text-xs text-spacex-white-40 font-mono">
                                                            <span>0:00</span>
                                                            <span>1:30</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        !pendingMission && (
                                            <div className="h-64 border border-spacex-white-10 flex flex-col items-center justify-center text-spacex-white-30">
                                                <span className="text-4xl mb-4">◎</span>
                                                <p className="uppercase tracking-widest text-sm">Monitoring Network for Missions...</p>
                                            </div>
                                        )
                                    )}

                                    {/* System Logs */}
                                    <div className="mt-8">
                                        <h3 className="spacex-label mb-3">System Event Log</h3>
                                        <div className="spacex-card p-4 font-mono text-xs text-spacex-white-60 h-48 overflow-y-auto scrollable">
                                            {logs.length === 0 ? (
                                                <div className="text-center py-4 text-spacex-white-30">System Nominal. No events.</div>
                                            ) : (
                                                <div className="space-y-1">
                                                    {logs.map(log => (
                                                        <div key={log.id} className="flex gap-4 p-1 hover:bg-spacex-card-hover rounded-sm">
                                                            <span className="text-spacex-white-40 shrink-0">[{log.timestamp}]</span>
                                                            <span className={
                                                                log.level === 'error' ? 'text-red-400' :
                                                                    log.level === 'warning' ? 'text-yellow-400' :
                                                                        log.level === 'success' ? 'text-[#00ff9d]' : ''
                                                            }>
                                                                {log.message}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Status & Queue */}
                                <div className="space-y-6">
                                    <DroneStatusWidget drone={drone} />

                                    {/* Pending Queue */}
                                    <div className="spacex-card p-6 flex flex-col" style={{ minHeight: '300px' }}>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="spacex-label">Mission Queue</h3>
                                            <span className="bg-spacex-white text-black px-2 py-0.5 text-xs font-bold rounded-sm">
                                                {missionQueue.length}
                                            </span>
                                        </div>

                                        {missionQueue.length === 0 ? (
                                            <div className="flex-1 flex flex-col items-center justify-center text-spacex-white-30">
                                                <span className="mb-2 opacity-50">≡</span>
                                                <span className="text-xs uppercase tracking-wider">Queue Empty</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {missionQueue.map((m, i) => (
                                                    <QueuedMissionItem key={m.mission_id} mission={m} index={i} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* PAGE: FLIGHT COMMANDS */}
                    {activePage === 'flight' && (
                        <div className="fade-in">
                            <FlightCommandPage drone={drone} addLog={addLog} />
                        </div>
                    )}

                    {/* PAGE: CAMERA FEED */}
                    {activePage === 'camera' && (
                        <div className="fade-in flex flex-col items-center justify-center pt-20">
                           <div className="w-[800px] aspect-video border border-spacex-white-15 bg-black flex flex-col items-center justify-center relative overflow-hidden">
                               <div className="absolute top-4 right-4 flex gap-2">
                                <span className="bg-red-500 animate-pulse w-2 h-2 rounded-full mt-1"></span>
                                <span className="text-xs font-mono text-red-500 uppercase tracking-widest">Live REC</span>
                               </div>
                               <span className="text-4xl mb-4 text-spacex-white-15">◎</span>
                               <p className="uppercase tracking-widest text-spacex-white-30 text-sm">VIDEO FEED PLACEHOLDER (Wait for Tauri Native Player)</p>
                           </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default App;
