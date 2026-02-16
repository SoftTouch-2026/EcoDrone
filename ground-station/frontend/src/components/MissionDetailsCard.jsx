export default function MissionDetailsCard({ mission }) {
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
                        {mission.priority >= 4 ? 'HIGH' : mission.priority >= 3 ? 'NORMAL' : 'LOW'}
                    </span>
                </div>

                <div className="spacex-data-row">
                    <span className="spacex-label">◎ Pickup Location</span>
                    <div className="text-spacex-white text-sm mt-1">{mission.pickup_location.name || 'Main Kitchen'}</div>
                    <div className="text-spacex-white-40 text-xs font-mono mt-0.5">
                        {mission.pickup_location.latitude.toFixed(4)}, {mission.pickup_location.longitude.toFixed(4)}
                    </div>
                </div>

                <div className="spacex-data-row">
                    <span className="spacex-label">◎ Delivery Location</span>
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
            </div>

            {mission.special_instructions && (
                <div className="mt-4 border border-spacex-white-15 p-3">
                    <div className="spacex-label mb-1">▸ Special Instructions</div>
                    <div className="text-spacex-white-70 text-sm">{mission.special_instructions}</div>
                </div>
            )}
        </div>
    );
}
