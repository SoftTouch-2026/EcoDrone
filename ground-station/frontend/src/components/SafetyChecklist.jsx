export default function SafetyChecklist({ mission }) {
    const checks = mission?.safety_checklist || {};

    const checkItems = [
        { key: 'battery_sufficient', label: 'Battery Level Sufficient', icon: '⚡' },
        { key: 'within_geofence', label: 'Route Within Geofence', icon: '◎' },
        { key: 'weather_acceptable', label: 'Weather Conditions OK', icon: '○' },
        { key: 'no_airspace_conflicts', label: 'No Airspace Conflicts', icon: '△' },
        { key: 'payload_acceptable', label: 'Payload Within Limits', icon: '□' },
    ];

    const allClear = checkItems.every(item => checks[item.key]);

    return (
        <div className="spacex-card p-6">
            <h3 className="spacex-label mb-4 flex items-center gap-2">
                <span className="text-base">◆</span>
                Safety Checklist
            </h3>
            <div className="space-y-0">
                {checkItems.map(item => (
                    <div key={item.key} className="spacex-data-row flex items-center gap-3">
                        <span className="text-spacex-white-50 text-sm">{item.icon}</span>
                        <span className="flex-1 text-sm text-spacex-white-80">{item.label}</span>
                        <span className={`text-sm font-medium ${checks[item.key] ? 'text-spacex-white' : 'text-spacex-white-40'}`}>
                            {checks[item.key] ? '✓ PASS' : '✗ FAIL'}
                        </span>
                    </div>
                ))}
            </div>
            <div className={`mt-4 py-3 text-center border ${allClear ? 'border-spacex-white-30 text-spacex-white' : 'border-spacex-white-15 text-spacex-white-50'
                }`}>
                <p className="text-sm font-medium uppercase tracking-wider">
                    {allClear ? '✓ All safety checks passed' : '△ Safety concerns detected'}
                </p>
            </div>
        </div>
    );
}
