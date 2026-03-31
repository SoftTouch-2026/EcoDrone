import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

// ============================================================
// CONFIGURATION
// ============================================================
const API_BASE_URL = 'http://localhost:5001';

const CAMPUS_BUILDINGS = [
    { name: 'MAIN KITCHEN', lat: 5.7596, lng: -0.2234 },
    { name: 'ENGINEERING', lat: 5.7610, lng: -0.2250 },
    { name: 'CAFETERIA', lat: 5.7592, lng: -0.2238 },
];

const GEOFENCE = {
    minLat: 5.7570, maxLat: 5.7620,
    minLng: -0.2260, maxLng: -0.2210,
};

// ============================================================
// ICONS (Minimal SVG)
// ============================================================
const CrosshairIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
const MapIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg>;
const SettingsIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const CheckCircle = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

// ============================================================
// MAIN APP COMPONENT (Kynetic Style)
// ============================================================
function App() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [sysStatus, setSysStatus] = useState('INIT');
    
    // Telemetry State
    const [drone, setDrone] = useState({
        drone_id: 'ANAFI Ai-1',
        battery: 0,
        sats: 0,
        signal: 0,
        status: 'DISCONNECTED',
        lat: 0, lng: 0, alt: 0, spd: 0, heading: 0
    });

    // Mission Control State
    const [destination, setDestination] = useState<{lat: number, lng: number} | null>(null);
    const [manualDest, setManualDest] = useState({ lat: '', lng: '' });
    const [altitude, setAltitude] = useState(35);
    const [speed, setSpeed] = useState(8);

    // Initial Tauri Setup
    useEffect(() => {
        const initBackend = async () => {
            try {
                await invoke('check_and_start_backend');
                setSysStatus('ONLINE');
            } catch {
                setSysStatus('OFFLINE');
            }
        };
        initBackend();
    }, []);

    // Telemetry Polling (Every 1s)
    useEffect(() => {
        const fetchTelemetry = async () => {
             if (sysStatus === 'OFFLINE') return;
             try {
                 const res = await fetch(`${API_BASE_URL}/api/telemetry`);
                 if (res.ok) {
                     const { data } = await res.json();
                     setDrone({
                         drone_id: 'ANAFI Ai-1',
                         battery: data.battery,
                         sats: data.sats,
                         signal: data.signal,
                         status: data.status.toUpperCase(),
                         lat: data.latitude,
                         lng: data.longitude,
                         alt: data.altitude,
                         spd: data.speed_kmh,
                         heading: data.heading
                     });
                 }
             } catch (e) {
                 // Silent fail for polling
             }
        };
        const interval = setInterval(fetchTelemetry, 1000);
        return () => clearInterval(interval);
    }, [sysStatus]);

    // Canvas Map Rendering
    const drawMap = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const drawW = rect.width;
        const drawH = rect.height;
        const padding = 60; // Extra padding for UI

        // Dark Stealth Map Background
        ctx.fillStyle = '#0F1115';
        ctx.fillRect(0, 0, drawW, drawH);

        // Subtle Thermal Grid Pattern
        ctx.strokeStyle = 'rgba(0, 217, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 20; i++) {
            const x = (i / 20) * drawW;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, drawH); ctx.stroke();
            const y = (i / 20) * drawH;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(drawW, y); ctx.stroke();
        }

        const toCanvas = (lat: number, lng: number) => {
            const x = padding + ((lng - GEOFENCE.minLng) / (GEOFENCE.maxLng - GEOFENCE.minLng)) * (drawW - padding * 2);
            const y = padding + ((GEOFENCE.maxLat - lat) / (GEOFENCE.maxLat - GEOFENCE.minLat)) * (drawH - padding * 2);
            return { x, y };
        };

        // Kynetic Style POIs (Campus Buildings)
        CAMPUS_BUILDINGS.forEach(b => {
            const { x, y } = toCanvas(b.lat, b.lng);
            // Outer ring
            ctx.strokeStyle = 'rgba(255, 77, 0, 0.4)'; // Thermal orange accent
            ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.stroke();
            // Center dot
            ctx.fillStyle = 'rgba(255, 77, 0, 0.8)';
            ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
            // Label
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = '10px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(b.name, x, y - 12);
        });

        // Destination Marker & Trajectory Line
        if (drone.lat !== 0 && destination) {
            const s = toCanvas(drone.lat, drone.lng);
            const d = toCanvas(destination.lat, destination.lng);
            
            // Trajectory Line
            ctx.strokeStyle = 'rgba(0, 217, 255, 0.4)'; // Cyan
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 6]);
            ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(d.x, d.y); ctx.stroke();
            ctx.setLineDash([]);
        }

        if (destination) {
            const { x, y } = toCanvas(destination.lat, destination.lng);
            // Target Box
            ctx.strokeStyle = '#00D9FF';
            ctx.lineWidth = 2;
            const size = 12;
            ctx.strokeRect(x - size/2, y - size/2, size, size);
            
            // Target Label
            ctx.fillStyle = 'rgba(0, 217, 255, 0.9)';
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('TARGET LOCK', x + (+size), y - (+size/2));
        }

        // Live Drone Position (HUD style)
        if (drone.lat !== 0) {
            const { x, y } = toCanvas(drone.lat, drone.lng);
            
            // Outer Glow/Radar ping
            ctx.fillStyle = 'rgba(0, 217, 255, 0.15)';
            ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2); ctx.fill();
            
            // Core Drone Icon (Triangle pointing heading)
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((drone.heading * Math.PI) / 180);
            ctx.fillStyle = '#00D9FF';
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.lineTo(6, 6);
            ctx.lineTo(-6, 6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // HUD Telemetry overlay next to drone
            ctx.strokeStyle = 'rgba(0, 217, 255, 0.3)';
            ctx.beginPath(); ctx.moveTo(x + 15, y - 15); ctx.lineTo(x + 30, y - 30); ctx.lineTo(x + 100, y - 30); ctx.stroke();
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '11px "JetBrains Mono", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`ALT: ${drone.alt.toFixed(1)}m`, x + 35, y - 35);
            ctx.fillText(`SPD: ${drone.spd.toFixed(1)}kph`, x + 35, y - 22);
        }

    }, [drone, destination]);

    useEffect(() => {
        drawMap();
        window.addEventListener('resize', drawMap);
        return () => window.removeEventListener('resize', drawMap);
    }, [drawMap]);

    // Map Interaction
    const handleCanvasClick = (e: any) => {
        if (drone.status === 'IN_FLIGHT') return; // Lock destination if flying
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const padding = 60;
        const drawW = rect.width;
        const drawH = rect.height;

        if (px < padding || px > drawW - padding || py < padding || py > drawH - padding) return;
        const lng = GEOFENCE.minLng + ((px - padding) / (drawW - padding * 2)) * (GEOFENCE.maxLng - GEOFENCE.minLng);
        const lat = GEOFENCE.maxLat - ((py - padding) / (drawH - padding * 2)) * (GEOFENCE.maxLat - GEOFENCE.minLat);
        const coords = { lat: Math.round(lat * 100000) / 100000, lng: Math.round(lng * 100000) / 100000 };
        setDestination(coords);
        setManualDest({ lat: coords.lat.toString(), lng: coords.lng.toString() });
    };

    const sendCommand = async () => {
        if (!destination) return;
        try {
            await fetch(`${API_BASE_URL}/api/delivery/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ waypoints: [[destination.lat, destination.lng]] })
            });
            // Telemetry loop will auto-update state
        } catch(e) { console.error("Dispatch Failed", e); }
    };

    const abortMission = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/delivery/abort`, { method: 'POST' });
        } catch(e) { console.error("Abort Failed", e); }
    };

    // Bento UI Panel Style
    const glassStyle = "bg-[#121212]/70 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl relative overflow-hidden";
    
    return (
        <div className="h-screen w-screen bg-[#0F1115] text-white font-sans overflow-hidden relative selection:bg-[#00D9FF]/30">
            {/* BACKGROUND MAP */}
            <canvas ref={canvasRef} onClick={handleCanvasClick} className="absolute inset-0 w-full h-full cursor-crosshair" />

            {/* TOP NAVIGATION HEADER */}
            <header className="absolute top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl h-16 bg-[#121212]/80 backdrop-blur-lg border border-white/10 rounded-full flex items-center justify-between px-6 z-10 shadow-lg">
                <div className="flex items-center gap-3">
                    <CrosshairIcon />
                    <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-white">EcoDrone</h1>
                    <div className="w-px h-6 bg-white/20 mx-3"></div>
                    <span className="text-[#00D9FF] text-xs font-mono tracking-widest flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sysStatus === 'ONLINE' ? 'bg-[#00D9FF]' : 'bg-red-500'}`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${sysStatus === 'ONLINE' ? 'bg-[#00D9FF]' : 'bg-red-500'}`}></span>
                        </span>
                        SYS {sysStatus}
                    </span>
                </div>
                
                <nav className="hidden lg:flex items-center gap-2 bg-black/40 p-1 rounded-full border border-white/5">
                    <button className="px-6 py-2 rounded-full text-xs font-medium tracking-wide text-white bg-white/10 hover:bg-white/20 transition-all">Overview</button>
                    <button className="px-6 py-2 rounded-full text-xs font-medium tracking-wide text-white/50 hover:text-white transition-all flex items-center gap-2"><MapIcon/> Missions</button>
                    <button className="px-6 py-2 rounded-full text-xs font-medium tracking-wide text-white/50 hover:text-white transition-all flex items-center gap-2"><SettingsIcon/> Settings</button>
                </nav>

                <div className="flex items-center gap-4 border border-white/10 rounded-full px-4 py-2 bg-black/40">
                    <span className="w-2 h-2 rounded-full bg-[#00E676]"></span>
                    <span className="text-xs font-mono tracking-wider">{drone.drone_id}</span>
                </div>
            </header>

            {/* BOTTOM BENTO BOX HUD */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6 z-10">
                
                {/* Panel 1: Drone Vital Signs */}
                <div className={`${glassStyle} p-6 flex flex-col justify-between`}>
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-white/40 text-[10px] tracking-[0.2em] uppercase">Vitals</h2>
                        <div className="flex items-center gap-2 bg-[#00E676]/10 text-[#00E676] px-3 py-1 rounded-full border border-[#00E676]/20">
                            <CheckCircle />
                            <span className="text-[10px] uppercase tracking-widest font-mono">{drone.status}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-8 mt-2">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                                <circle cx="48" cy="48" r="44" fill="none" stroke={drone.battery > 20 ? "#00D9FF" : "#FF5555"} strokeWidth="6" 
                                        strokeDasharray="276.46" strokeDashoffset={276.46 - (276.46 * drone.battery) / 100} 
                                        strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                            </svg>
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-mono font-light">{drone.battery}%</span>
                            </div>
                        </div>
                        
                        <div className="space-y-4 flex-1">
                            <div>
                                <div className="text-white/40 text-[10px] tracking-widest uppercase mb-1">GPS SATS</div>
                                <div className="text-lg font-mono text-white/90">{drone.sats < 8 ? 'SEARCHING...' : `${drone.sats} Locked`}</div>
                            </div>
                            <div>
                                <div className="text-white/40 text-[10px] tracking-widest uppercase mb-1">LINK QUALITY</div>
                                <div className="flex gap-1">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className={`h-2 flex-1 rounded-sm ${i <= drone.signal ? 'bg-[#00D9FF]' : 'bg-white/10'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel 2: Mission Planning / Target Map UI */}
                <div className={`${glassStyle} p-6`}>
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-white/40 text-[10px] tracking-[0.2em] uppercase">Mission Map Targets</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-black/50 border border-white/5 rounded-xl p-3">
                            <label className="text-white/30 text-[10px] tracking-widest block mb-2">LATITUDE</label>
                            <input type="text" value={manualDest.lat} readOnly className="w-full bg-transparent text-white font-mono text-xl outline-none" placeholder="-.---" />
                        </div>
                        <div className="bg-black/50 border border-white/5 rounded-xl p-3">
                            <label className="text-white/30 text-[10px] tracking-widest block mb-2">LONGITUDE</label>
                            <input type="text" value={manualDest.lng} readOnly className="w-full bg-transparent text-white font-mono text-xl outline-none" placeholder="-.---" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-white/30 text-[10px] tracking-widest block mb-2">ALTITUDE (m)</label>
                            <input type="number" value={altitude} onChange={e=>setAltitude(parseInt(e.target.value)||0)} className="w-full bg-transparent text-white font-mono border-b border-white/20 pb-1 outline-none text-lg" />
                        </div>
                        <div>
                            <label className="text-white/30 text-[10px] tracking-widest block mb-2">SPEED (m/s)</label>
                            <input type="number" value={speed} onChange={e=>setSpeed(parseInt(e.target.value)||0)} className="w-full bg-transparent text-white font-mono border-b border-white/20 pb-1 outline-none text-lg" />
                        </div>
                    </div>
                </div>

                {/* Panel 3: Action Hub */}
                 <div className={`${glassStyle} p-6 flex flex-col justify-between`}>
                    <h2 className="text-white/40 text-[10px] tracking-[0.2em] uppercase mb-4">Command Sequence</h2>
                     
                    <div className="flex-1 flex flex-col justify-end gap-3">
                        {drone.status === 'IN_FLIGHT' || drone.status === 'LANDING' ? (
                             <button onClick={abortMission} className="w-full py-4 rounded-xl bg-[#FF3333]/10 border border-[#FF3333]/50 text-[#FF3333] font-mono tracking-[0.2em] transition-all hover:bg-[#FF3333] hover:text-white uppercase font-bold shadow-[0_0_20px_rgba(255,51,51,0.3)]">
                                ABORT MISSION
                            </button>
                        ) : (
                            <button onClick={sendCommand} disabled={!destination} className={`w-full py-4 rounded-xl border font-mono tracking-[0.2em] transition-all font-bold ${destination ? 'border-[#00D9FF]/50 text-[#00D9FF] bg-[#00D9FF]/10 hover:bg-[#00D9FF] hover:text-black shadow-[0_0_15px_rgba(0,217,255,0.4)]' : 'border-white/10 text-white/20 bg-black/50 cursor-not-allowed'}`}>
                                EXECUTE SCAN
                            </button>
                        )}
                        
                        <button onClick={() => { setDestination(null); setManualDest({lat:'', lng:''}); }} className="w-full py-3 rounded-xl border border-white/5 bg-white/5 text-white/50 text-xs font-mono tracking-[0.2em] hover:text-white hover:bg-white/10 transition-all">
                            CLEAR TARGET
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default App;
