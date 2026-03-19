import { useState, useCallback } from 'react';
import FlightMap from '../components/FlightMap';
import { CAMPUS_BUILDINGS } from '../constants/campus';
import * as api from '../api/droneApi';

export default function FlightCommandPage() {
    const [source, setSource] = useState(null);
    const [destination, setDestination] = useState(null);
    const [clickMode, setClickMode] = useState('source');
    const [altitude, setAltitude] = useState(10);
    const [speed, setSpeed] = useState(5);
    const [commandLog, setCommandLog] = useState([]);

    const addCmd = useCallback((msg, type = 'info') => {
        setCommandLog(prev => [{
            timestamp: new Date().toLocaleTimeString(),
            message: msg,
            type,
        }, ...prev].slice(0, 30));
    }, []);

    const handleMapClick = (coords) => {
        if (clickMode === 'source') {
            setSource(coords);
            setClickMode('destination');
            addCmd(`Source set: ${coords.lat}, ${coords.lng}`);
        } else {
            setDestination(coords);
            setClickMode('source');
            addCmd(`Destination set: ${coords.lat}, ${coords.lng}`);
        }
    };

    const handleQuickPick = (building) => {
        const coords = { lat: building.lat, lng: building.lng };
        if (clickMode === 'source') {
            setSource(coords);
            setClickMode('destination');
            addCmd(`Source: ${building.name} (${coords.lat}, ${coords.lng})`);
        } else {
            setDestination(coords);
            setClickMode('source');
            addCmd(`Destination: ${building.name} (${coords.lat}, ${coords.lng})`);
        }
    };

    const sendCommand = async () => {
        if (!source || !destination) return;

        addCmd(`Sending flight: ${source.lat},${source.lng} → ${destination.lat},${destination.lng} | Alt: ${altitude}m | Spd: ${speed}m/s`);

        const res = await api.navigate(destination.lat, destination.lng, altitude);
        if (res.success) {
            addCmd(`✓ Flight command accepted: ${res.message}`, 'success');
        } else {
            addCmd(`✗ Flight command failed: ${res.message || res.error}`, 'error');
        }
    };

    const clearAll = () => {
        setSource(null);
        setDestination(null);
        setClickMode('source');
        addCmd('Map cleared');
    };

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
            {/* Map Panel */}
            <div className="lg:col-span-2 space-y-4">
                <FlightMap
                    source={source}
                    destination={destination}
                    clickMode={clickMode}
                    onMapClick={handleMapClick}
                />

                {/* Quick-pick + Map legend */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="spacex-card p-4">
                        <h4 className="spacex-label mb-3">Quick Pick Location</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {CAMPUS_BUILDINGS.map(b => (
                                <button
                                    key={b.name}
                                    onClick={() => handleQuickPick(b)}
                                    className="spacex-btn-outline text-xs py-2 px-2"
                                >
                                    {b.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="spacex-card p-4">
                        <h4 className="spacex-label mb-3">Map Legend</h4>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-spacex-white rounded-full inline-block" />
                                <span className="text-spacex-white-60">Source Point</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-spacex-white rotate-45 inline-block" />
                                <span className="text-spacex-white-60">Destination Point</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-6 border-t border-dashed border-spacex-white-50 inline-block" />
                                <span className="text-spacex-white-60">Flight Path</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-3 border border-spacex-white-30 bg-spacex-white-10 inline-block" />
                                <span className="text-spacex-white-60">Campus Building</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Command Panel */}
            <div className="space-y-4">
                {/* Mode Toggle */}
                <div className="spacex-card p-4">
                    <h4 className="spacex-label mb-3">Click Mode</h4>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setClickMode('source')}
                            className={`flex-1 py-2 text-xs uppercase tracking-wider ${clickMode === 'source' ? 'spacex-btn-primary' : 'spacex-btn-outline'
                                }`}
                        >
                            ◉ Source
                        </button>
                        <button
                            onClick={() => setClickMode('destination')}
                            className={`flex-1 py-2 text-xs uppercase tracking-wider ${clickMode === 'destination' ? 'spacex-btn-primary' : 'spacex-btn-outline'
                                }`}
                        >
                            ◆ Destination
                        </button>
                    </div>
                </div>

                {/* Source Coordinates */}
                <div className="spacex-card p-4">
                    <h4 className="spacex-label mb-3">◉ Source Coordinates</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="spacex-label text-[10px]">Lat</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={source?.lat || ''}
                                onChange={e => setSource({ ...source, lat: parseFloat(e.target.value), lng: source?.lng || 0 })}
                                className="spacex-input text-xs"
                                placeholder="5.7596"
                            />
                        </div>
                        <div>
                            <label className="spacex-label text-[10px]">Lng</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={source?.lng || ''}
                                onChange={e => setSource({ lat: source?.lat || 0, lng: parseFloat(e.target.value) })}
                                className="spacex-input text-xs"
                                placeholder="-0.2234"
                            />
                        </div>
                    </div>
                </div>

                {/* Destination Coordinates */}
                <div className="spacex-card p-4">
                    <h4 className="spacex-label mb-3">◆ Destination Coordinates</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="spacex-label text-[10px]">Lat</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={destination?.lat || ''}
                                onChange={e => setDestination({ ...destination, lat: parseFloat(e.target.value), lng: destination?.lng || 0 })}
                                className="spacex-input text-xs"
                                placeholder="5.7605"
                            />
                        </div>
                        <div>
                            <label className="spacex-label text-[10px]">Lng</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={destination?.lng || ''}
                                onChange={e => setDestination({ lat: destination?.lat || 0, lng: parseFloat(e.target.value) })}
                                className="spacex-input text-xs"
                                placeholder="-0.2245"
                            />
                        </div>
                    </div>
                </div>

                {/* Flight Parameters */}
                <div className="spacex-card p-4">
                    <h4 className="spacex-label mb-3">Flight Parameters</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="spacex-label text-[10px]">Altitude (m)</label>
                            <input type="number" min="2" max="50" value={altitude} onChange={e => setAltitude(Number(e.target.value))} className="spacex-input text-sm" />
                        </div>
                        <div>
                            <label className="spacex-label text-[10px]">Speed (m/s)</label>
                            <input type="number" min="1" max="15" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="spacex-input text-sm" />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={sendCommand}
                        disabled={!source || !destination}
                        className={`flex-1 py-3 text-sm uppercase tracking-wider font-medium ${source && destination ? 'spacex-btn-primary' : 'spacex-btn-primary opacity-30 cursor-not-allowed'
                            }`}
                    >
                        ▸ Send Flight Command
                    </button>
                    <button onClick={clearAll} className="spacex-btn-outline py-3 px-4 text-sm">
                        ✗ Clear
                    </button>
                </div>

                {/* Command Log */}
                <div className="spacex-card p-4">
                    <h4 className="spacex-label mb-3">Command Log</h4>
                    <div className="bg-black border border-spacex-white-10 p-3 h-44 overflow-y-auto scrollable font-mono text-xs">
                        {commandLog.length === 0 ? (
                            <div className="text-spacex-white-30 text-center py-4">No commands sent</div>
                        ) : (
                            commandLog.map((c, i) => (
                                <div key={i} className={`mb-1 ${c.type === 'error' ? 'text-error' : c.type === 'success' ? 'text-success' : 'text-spacex-white-50'
                                    }`}>
                                    <span className="text-spacex-white-30">[{c.timestamp}]</span> {c.message}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
