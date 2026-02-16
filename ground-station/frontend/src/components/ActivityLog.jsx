export default function ActivityLog({ logs, onClear }) {
    return (
        <div className="spacex-card p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="spacex-label flex items-center gap-2">
                    <span className="text-base">≡</span>
                    Activity Log
                </h2>
                <button onClick={onClear} className="spacex-btn-outline text-xs px-3 py-1">
                    Clear
                </button>
            </div>
            <div className="bg-black border border-spacex-white-10 p-4 h-64 overflow-y-auto scrollable font-mono text-xs">
                {logs.length === 0 ? (
                    <div className="text-spacex-white-30 text-center py-8">No activity yet</div>
                ) : (
                    logs.map((log, i) => (
                        <div
                            key={i}
                            className={`mb-1.5 flex items-start gap-2 ${log.type === 'error' ? 'text-error' :
                                    log.type === 'success' ? 'text-success' :
                                        log.type === 'warning' ? 'text-spacex-white-60' :
                                            'text-spacex-white-40'
                                }`}
                        >
                            <span className="text-spacex-white-30 shrink-0">[{log.timestamp}]</span>
                            <span className="shrink-0">▸</span>
                            <span>{log.message}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
