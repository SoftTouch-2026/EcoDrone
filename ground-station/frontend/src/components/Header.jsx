import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { GROUND_STATION_ID } from '../constants/campus';
import * as api from '../api/droneApi';

export default function Header() {
    const [health, setHealth] = useState(null);

    useEffect(() => {
        api.getHealth().then(setHealth);
    }, []);

    return (
        <header className="max-w-7xl mx-auto mb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-light text-spacex-white flex items-center gap-4 tracking-wide">
                        <span>
                            <span className="font-semibold">Eco</span>Drone
                        </span>
                        <span className="text-xs font-light bg-spacex-white-10 text-spacex-white-60 px-4 py-1.5 border border-spacex-white-15 uppercase tracking-widest">
                            Ground Station Operator
                        </span>
                    </h1>
                    <p className="text-spacex-white-50 mt-2 text-sm">
                        Station ID: {GROUND_STATION_ID}
                        {health && (
                            <span className="ml-3">
                                • Olympe: {health.olympe ? '✓ Available' : '✗ Simulation'}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <nav className="mt-6 flex gap-0 border-b border-spacex-white-10">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `px-6 py-3 text-xs font-medium uppercase tracking-widest transition-all border-b-2 -mb-px ${isActive
                            ? 'border-spacex-white text-spacex-white'
                            : 'border-transparent text-spacex-white-30 hover:text-spacex-white-60'
                        }`
                    }
                >
                    ▣ Missions
                </NavLink>
                <NavLink
                    to="/flight"
                    className={({ isActive }) =>
                        `px-6 py-3 text-xs font-medium uppercase tracking-widest transition-all border-b-2 -mb-px ${isActive
                            ? 'border-spacex-white text-spacex-white'
                            : 'border-transparent text-spacex-white-30 hover:text-spacex-white-60'
                        }`
                    }
                >
                    △ Flight Command
                </NavLink>
                <NavLink
                    to="/command"
                    className={({ isActive }) =>
                        `px-6 py-3 text-xs font-medium uppercase tracking-widest transition-all border-b-2 -mb-px ${isActive
                            ? 'border-spacex-white text-spacex-white'
                            : 'border-transparent text-spacex-white-30 hover:text-spacex-white-60'
                        }`
                    }
                >
                    ▸ Direct Command
                </NavLink>
            </nav>
        </header>
    );
}
