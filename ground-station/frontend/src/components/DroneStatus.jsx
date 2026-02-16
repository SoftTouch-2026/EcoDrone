export default function DroneStatus({ drone }) {
    if (!drone) return null;

    return (
        <div className="spacex-card p-6">
            <h3 className="spacex-label mb-4 flex items-center gap-2">
                <span className="text-base">▣</span>
                Drone Status
            </h3>

            <div>
                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">State</span>
                    <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider border border-spacex-white-30 text-spacex-white">
                        {drone.state || 'unknown'}
                    </span>
                </div>

                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">Connected</span>
                    <span className={`text-sm font-medium ${drone.connected ? 'text-success' : 'text-spacex-white-40'}`}>
                        {drone.connected ? '✓ YES' : '✗ NO'}
                    </span>
                </div>

                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">Battery</span>
                    <span className={`text-sm font-medium ${drone.battery_level > 50 ? 'text-spacex-white' :
                            drone.battery_level > 20 ? 'text-warning' : 'text-error'
                        }`}>
                        {drone.battery_level?.toFixed(1)}%
                    </span>
                </div>

                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">Altitude</span>
                    <span className="text-spacex-white text-sm font-mono">{drone.altitude?.toFixed(1)}m</span>
                </div>

                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">Position</span>
                    <span className="text-spacex-white-70 text-xs font-mono">
                        {drone.latitude?.toFixed(4)}, {drone.longitude?.toFixed(4)}
                    </span>
                </div>

                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">Mode</span>
                    <span className="text-spacex-white-60 text-sm">{drone.connection_mode || 'none'}</span>
                </div>

                <div className="spacex-data-row flex items-center justify-between">
                    <span className="spacex-label">Model</span>
                    <span className="text-spacex-white-60 text-sm">{drone.drone_model || 'ANAFI Ai'}</span>
                </div>
            </div>

            {drone.message && (
                <div className="mt-4 border border-spacex-white-15 p-3">
                    <div className="spacex-label mb-1">▸ Message</div>
                    <div className="text-spacex-white-70 text-sm">{drone.message}</div>
                </div>
            )}
        </div>
    );
}
