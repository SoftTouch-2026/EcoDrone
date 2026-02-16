import { useState, useEffect, useCallback } from 'react';
import DroneStatus from '../components/DroneStatus';
import MissionDetailsCard from '../components/MissionDetailsCard';
import SafetyChecklist from '../components/SafetyChecklist';
import ActivityLog from '../components/ActivityLog';
import * as api from '../api/droneApi';

/* Sample simulated missions for demonstration */
const SAMPLE_MISSIONS = [
    {
        mission_id: 'MSN-001',
        priority: 4,
        status: 'pending_approval',
        requested_at: new Date().toISOString(),
        pickup_location: { name: 'Main Kitchen', latitude: 5.7596, longitude: -0.2234 },
        delivery_location: { name: 'Dorm Block C', latitude: 5.7605, longitude: -0.2245 },
        distance_meters: 450,
        estimated_flight_time: 4,
        payload_weight_grams: 350,
        special_instructions: 'Hot food - handle with care',
        safety_checklist: { battery_sufficient: true, within_geofence: true, weather_acceptable: true, no_airspace_conflicts: true, payload_acceptable: true },
    },
    {
        mission_id: 'MSN-002',
        priority: 3,
        status: 'pending_approval',
        requested_at: new Date(Date.now() - 120000).toISOString(),
        pickup_location: { name: 'Library', latitude: 5.7600, longitude: -0.2230 },
        delivery_location: { name: 'Engineering Block', latitude: 5.7610, longitude: -0.2250 },
        distance_meters: 280,
        estimated_flight_time: 3,
        payload_weight_grams: 120,
        special_instructions: null,
        safety_checklist: { battery_sufficient: true, within_geofence: true, weather_acceptable: true, no_airspace_conflicts: false, payload_acceptable: true },
    },
];

export default function MissionsPage() {
    const [drone, setDrone] = useState(null);
    const [missions] = useState(SAMPLE_MISSIONS);
    const [selectedMission, setSelectedMission] = useState(SAMPLE_MISSIONS[0]);
    const [missionQueue, setMissionQueue] = useState([]);
    const [logs, setLogs] = useState([]);

    const addLog = useCallback((message, type = 'info') => {
        setLogs(prev => [{
            timestamp: new Date().toLocaleTimeString(),
            message,
            type,
        }, ...prev].slice(0, 50));
    }, []);

    useEffect(() => {
        const poll = () => api.getStatus().then(res => {
            if (res.success) setDrone(res.data);
        });
        poll();
        const interval = setInterval(poll, 3000);
        return () => clearInterval(interval);
    }, []);

    const approveMission = (mission) => {
        setMissionQueue(prev => [...prev, { ...mission, status: 'queued' }]);
        addLog(`Mission ${mission.mission_id} approved and queued`, 'success');
    };

    const rejectMission = (mission) => {
        addLog(`Mission ${mission.mission_id} rejected`, 'warning');
    };

    return (
        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
            {/* Left: Pending Missions */}
            <div className="lg:col-span-2 space-y-6">
                <div className="spacex-card p-6">
                    <h2 className="spacex-label mb-4 flex items-center gap-2">
                        <span className="text-base">▣</span>
                        Pending Mission Requests
                    </h2>
                    <div className="space-y-2">
                        {missions.map(m => (
                            <div
                                key={m.mission_id}
                                onClick={() => setSelectedMission(m)}
                                className={`spacex-card-subtle p-4 cursor-pointer transition-all hover:border-spacex-white-30 ${selectedMission?.mission_id === m.mission_id ? 'border-spacex-white-30' : ''
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-spacex-white font-mono text-sm">{m.mission_id}</span>
                                        <span className="ml-3 text-spacex-white-40 text-xs">
                                            {m.pickup_location.name} → {m.delivery_location.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-spacex-white-40 font-mono">
                                            {m.distance_meters}m
                                        </span>
                                        <span className={`w-2 h-2 rounded-full ${m.priority >= 4 ? 'bg-spacex-white' : 'bg-spacex-white-40'}`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedMission && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MissionDetailsCard mission={selectedMission} />
                        <SafetyChecklist mission={selectedMission} />
                    </div>
                )}

                {selectedMission && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => approveMission(selectedMission)}
                            className="spacex-btn-primary py-3 px-6 text-sm"
                        >
                            ✓ Approve Mission
                        </button>
                        <button
                            onClick={() => rejectMission(selectedMission)}
                            className="spacex-btn-danger py-3 px-6 text-sm"
                        >
                            ✗ Reject
                        </button>
                    </div>
                )}
            </div>

            {/* Right: Sidebar */}
            <div className="space-y-6">
                <DroneStatus drone={drone} />

                <div className="spacex-card p-6">
                    <h2 className="spacex-label mb-4 flex items-center gap-2">
                        <span className="text-base">≡</span>
                        Mission Queue ({missionQueue.length})
                    </h2>
                    {missionQueue.length === 0 ? (
                        <p className="text-spacex-white-30 text-sm text-center py-6">Queue empty</p>
                    ) : (
                        <div className="space-y-2">
                            {missionQueue.map(m => (
                                <div key={m.mission_id} className="spacex-data-row flex items-center justify-between py-2">
                                    <span className="font-mono text-sm text-spacex-white">{m.mission_id}</span>
                                    <span className="text-xs uppercase text-spacex-white-50">{m.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <ActivityLog logs={logs} onClear={() => setLogs([])} />
            </div>
        </main>
    );
}
