import { useState, useEffect, useCallback } from 'react';
import DroneStatus from '../components/DroneStatus';
import { CAMPUS_BUILDINGS } from '../constants/campus';
import * as api from '../api/droneApi';

export default function DirectCommandPage() {
    const [drone, setDrone] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState('');

    // GPS Navigate form
    const [navLat, setNavLat] = useState('');
    const [navLng, setNavLng] = useState('');
    const [navAlt, setNavAlt] = useState('10');

    // Relative move form
    const [moveFwd, setMoveFwd] = useState('0');
    const [moveRight, setMoveRight] = useState('0');
    const [moveUp, setMoveUp] = useState('0');
    const [moveRot, setMoveRot] = useState('0');

    const addLog = useCallback((message, type = 'info') => {
        setLogs(prev => [{
            timestamp: new Date().toLocaleTimeString(),
            message,
            type,
        }, ...prev].slice(0, 100));
    }, []);

    const refreshStatus = useCallback(async () => {
        const res = await api.getStatus();
        if (res.success) setDrone(res.data);
        return res;
    }, []);

    useEffect(() => {
        refreshStatus();
        const interval = setInterval(refreshStatus, 3000);
        return () => clearInterval(interval);
    }, [refreshStatus]);

    const runCommand = async (name, fn) => {
        setLoading(name);
        addLog(`> ${name}...`);
        try {
            const res = await fn();
            if (res.success) {
                addLog(`✓ ${res.message || name + ' succeeded'}`, 'success');
                if (res.data) setDrone(res.data);
            } else {
                addLog(`✗ ${res.message || res.error || name + ' failed'}`, 'error');
            }
        } catch (e) {
            addLog(`✗ Error: ${e.message}`, 'error');
        }
        setLoading('');
        refreshStatus();
    };

    const quickPickNav = (b) => {
        setNavLat(String(b.lat));
        setNavLng(String(b.lng));
        addLog(`Location set: ${b.name} (${b.lat}, ${b.lng})`);
    };

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
            {/* Left: Command Controls */}
            <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions */}
                <div className="spacex-card p-6">
                    <h2 className="spacex-label mb-4 flex items-center gap-2">
                        <span className="text-base">▸</span>
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                            onClick={() => runCommand('Connect', api.connectDrone)}
                            disabled={!!loading}
                            className="spacex-btn-outline py-4 text-sm flex flex-col items-center gap-1"
                        >
                            <span className="text-lg">🔗</span>
                            <span>{loading === 'Connect' ? '...' : 'Connect'}</span>
                        </button>
                        <button
                            onClick={() => runCommand('Takeoff', api.takeoff)}
                            disabled={!!loading}
                            className="spacex-btn-primary py-4 text-sm flex flex-col items-center gap-1"
                        >
                            <span className="text-lg">🚁</span>
                            <span>{loading === 'Takeoff' ? '...' : 'Takeoff'}</span>
                        </button>
                        <button
                            onClick={() => runCommand('Land', api.land)}
                            disabled={!!loading}
                            className="spacex-btn-outline py-4 text-sm flex flex-col items-center gap-1"
                        >
                            <span className="text-lg">🛬</span>
                            <span>{loading === 'Land' ? '...' : 'Land'}</span>
                        </button>
                        <button
                            onClick={() => runCommand('Disconnect', api.disconnectDrone)}
                            disabled={!!loading}
                            className="spacex-btn-danger py-4 text-sm flex flex-col items-center gap-1"
                        >
                            <span className="text-lg">🔌</span>
                            <span>{loading === 'Disconnect' ? '...' : 'Disconnect'}</span>
                        </button>
                    </div>
                </div>

                {/* GPS Navigation */}
                <div className="spacex-card p-6">
                    <h2 className="spacex-label mb-4 flex items-center gap-2">
                        <span className="text-base">📍</span>
                        GPS Navigation (goto)
                    </h2>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="spacex-label text-[10px]">Latitude</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={navLat}
                                onChange={e => setNavLat(e.target.value)}
                                className="spacex-input"
                                placeholder="5.7610"
                            />
                        </div>
                        <div>
                            <label className="spacex-label text-[10px]">Longitude</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={navLng}
                                onChange={e => setNavLng(e.target.value)}
                                className="spacex-input"
                                placeholder="-0.2250"
                            />
                        </div>
                        <div>
                            <label className="spacex-label text-[10px]">Altitude (m)</label>
                            <input
                                type="number"
                                min="2"
                                max="50"
                                value={navAlt}
                                onChange={e => setNavAlt(e.target.value)}
                                className="spacex-input"
                                placeholder="10"
                            />
                        </div>
                    </div>

                    {/* Quick-pick buildings */}
                    <div className="mb-4">
                        <label className="spacex-label text-[10px] mb-2 block">Quick Pick</label>
                        <div className="flex flex-wrap gap-2">
                            {CAMPUS_BUILDINGS.map(b => (
                                <button
                                    key={b.name}
                                    onClick={() => quickPickNav(b)}
                                    className="spacex-btn-outline text-xs py-1.5 px-3"
                                >
                                    {b.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => runCommand(
                            `Navigate → ${navLat}, ${navLng}`,
                            () => api.navigate(parseFloat(navLat), parseFloat(navLng), parseFloat(navAlt || 10))
                        )}
                        disabled={!navLat || !navLng || !!loading}
                        className="spacex-btn-primary w-full py-3 text-sm"
                    >
                        {loading.startsWith('Navigate') ? '...' : '▸ Navigate to Coordinates'}
                    </button>
                </div>

                {/* Relative Movement */}
                <div className="spacex-card p-6">
                    <h2 className="spacex-label mb-4 flex items-center gap-2">
                        <span className="text-base">↗</span>
                        Relative Movement (move)
                    </h2>
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        <div>
                            <label className="spacex-label text-[10px]">Forward (m)</label>
                            <input type="number" value={moveFwd} onChange={e => setMoveFwd(e.target.value)} className="spacex-input" />
                        </div>
                        <div>
                            <label className="spacex-label text-[10px]">Right (m)</label>
                            <input type="number" value={moveRight} onChange={e => setMoveRight(e.target.value)} className="spacex-input" />
                        </div>
                        <div>
                            <label className="spacex-label text-[10px]">Up (m)</label>
                            <input type="number" value={moveUp} onChange={e => setMoveUp(e.target.value)} className="spacex-input" />
                        </div>
                        <div>
                            <label className="spacex-label text-[10px]">Rotation (°)</label>
                            <input type="number" value={moveRot} onChange={e => setMoveRot(e.target.value)} className="spacex-input" />
                        </div>
                    </div>
                    <button
                        onClick={() => runCommand(
                            `Move fwd=${moveFwd} right=${moveRight} up=${moveUp}`,
                            () => api.moveBy(parseFloat(moveFwd), parseFloat(moveRight), parseFloat(moveUp), parseFloat(moveRot))
                        )}
                        disabled={!!loading}
                        className="spacex-btn-primary w-full py-3 text-sm"
                    >
                        {loading.startsWith('Move') ? '...' : '▸ Execute Movement'}
                    </button>
                </div>

                {/* Utility Actions */}
                <div className="spacex-card p-6">
                    <h2 className="spacex-label mb-4 flex items-center gap-2">
                        <span className="text-base">⚙</span>
                        Utility
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => runCommand('Status', async () => {
                                const res = await api.getStatus();
                                if (res.success && res.data) {
                                    addLog(`State: ${res.data.state} | Battery: ${res.data.battery_level}% | Alt: ${res.data.altitude}m | Pos: ${res.data.latitude?.toFixed(4)}, ${res.data.longitude?.toFixed(4)}`);
                                }
                                return res;
                            })}
                            disabled={!!loading}
                            className="spacex-btn-outline py-3 text-sm"
                        >
                            📊 Refresh Status
                        </button>
                        <button
                            onClick={() => runCommand('Battery', async () => {
                                const res = await api.getBattery();
                                if (res.success && res.data) {
                                    addLog(`🔋 Battery: ${res.data.battery_level}% | Connected: ${res.data.connected}`);
                                }
                                return res;
                            })}
                            disabled={!!loading}
                            className="spacex-btn-outline py-3 text-sm"
                        >
                            🔋 Check Battery
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Status + Log */}
            <div className="space-y-6">
                <DroneStatus drone={drone} />

                {/* Command History */}
                <div className="spacex-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="spacex-label flex items-center gap-2">
                            <span className="text-base">≡</span>
                            Command History
                        </h2>
                        <button onClick={() => setLogs([])} className="spacex-btn-outline text-xs px-3 py-1">
                            Clear
                        </button>
                    </div>
                    <div className="bg-black border border-spacex-white-10 p-4 overflow-y-auto scrollable font-mono text-xs" style={{ height: '400px' }}>
                        {logs.length === 0 ? (
                            <div className="text-spacex-white-30 text-center py-8">No commands yet. Use the controls above.</div>
                        ) : (
                            logs.map((log, i) => (
                                <div
                                    key={i}
                                    className={`mb-1.5 flex items-start gap-2 ${log.type === 'error' ? 'text-error' :
                                            log.type === 'success' ? 'text-success' :
                                                'text-spacex-white-40'
                                        }`}
                                >
                                    <span className="text-spacex-white-30 shrink-0">[{log.timestamp}]</span>
                                    <span>{log.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
