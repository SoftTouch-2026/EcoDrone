# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## How to Run the Ground Station Locally

To run the full ground station interface with real simulated data locally, you need two terminal windows:

**1. Start the Python FastAPI Server (Terminal 1)**
```bash
cd ground-station
export DRONE_CONNECTION_MODE="simulation"
./olympe-venv/bin/python api/app.py
```

**2. Start the Tauri UI Application (Terminal 2)**
```bash
cd ground-station/operator-interface
npm run tauri dev
```
