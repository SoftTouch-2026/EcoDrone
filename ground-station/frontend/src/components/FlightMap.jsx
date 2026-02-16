import { useRef, useEffect, useCallback } from 'react';
import { CAMPUS_BUILDINGS, GEOFENCE } from '../constants/campus';

/**
 * FlightMap - Canvas-based GPS map component.
 * Shows campus buildings, geofence, source/destination markers, and flight path.
 */
export default function FlightMap({ source, destination, clickMode, onMapClick }) {
    const canvasRef = useRef(null);

    const drawMap = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const drawW = rect.width;
        const drawH = rect.height;
        const padding = 60;

        // Background
        ctx.fillStyle = 'rgba(10, 10, 15, 1)';
        ctx.fillRect(0, 0, drawW, drawH);

        // Grid
        for (let i = 0; i <= 10; i++) {
            ctx.strokeStyle = 'rgba(240, 240, 250, 0.06)';
            ctx.lineWidth = 1;
            const x = padding + (i / 10) * (drawW - padding * 2);
            ctx.beginPath(); ctx.moveTo(x, padding); ctx.lineTo(x, drawH - padding); ctx.stroke();
            const y = padding + (i / 10) * (drawH - padding * 2);
            ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(drawW - padding, y); ctx.stroke();
        }

        // Axis labels
        ctx.fillStyle = 'rgba(240, 240, 250, 0.35)';
        ctx.font = '10px Inter, monospace';
        ctx.textAlign = 'center';
        for (let i = 0; i <= 5; i++) {
            const lng = GEOFENCE.minLng + (i / 5) * (GEOFENCE.maxLng - GEOFENCE.minLng);
            const x = padding + (i / 5) * (drawW - padding * 2);
            ctx.fillText(lng.toFixed(4), x, drawH - padding + 20);
        }
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const lat = GEOFENCE.maxLat - (i / 5) * (GEOFENCE.maxLat - GEOFENCE.minLat);
            const y = padding + (i / 5) * (drawH - padding * 2);
            ctx.fillText(lat.toFixed(4), padding - 8, y + 4);
        }

        // Axis titles
        ctx.fillStyle = 'rgba(240, 240, 250, 0.25)';
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LONGITUDE', drawW / 2, drawH - padding + 40);
        ctx.save();
        ctx.translate(15, drawH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('LATITUDE', 0, 0);
        ctx.restore();

        // Geofence boundary
        ctx.strokeStyle = 'rgba(240, 240, 250, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(padding, padding, drawW - padding * 2, drawH - padding * 2);
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(240, 240, 250, 0.2)';
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('GEOFENCE BOUNDARY', padding + 4, padding - 6);

        const toCanvas = (lat, lng) => ({
            x: padding + ((lng - GEOFENCE.minLng) / (GEOFENCE.maxLng - GEOFENCE.minLng)) * (drawW - padding * 2),
            y: padding + ((GEOFENCE.maxLat - lat) / (GEOFENCE.maxLat - GEOFENCE.minLat)) * (drawH - padding * 2),
        });

        // Buildings
        CAMPUS_BUILDINGS.forEach(b => {
            const { x, y } = toCanvas(b.lat, b.lng);
            ctx.fillStyle = 'rgba(240, 240, 250, 0.12)';
            ctx.fillRect(x - 16, y - 10, 32, 20);
            ctx.strokeStyle = 'rgba(240, 240, 250, 0.25)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x - 16, y - 10, 32, 20);
            ctx.fillStyle = 'rgba(240, 240, 250, 0.5)';
            ctx.font = '9px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(b.name.toUpperCase(), x, y - 16);
            ctx.fillStyle = 'rgba(240, 240, 250, 0.4)';
            ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
        });

        // Flight path
        if (source && destination) {
            const s = toCanvas(source.lat, source.lng);
            const d = toCanvas(destination.lat, destination.lng);
            ctx.strokeStyle = 'rgba(240, 240, 250, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([8, 6]);
            ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(d.x, d.y); ctx.stroke();
            ctx.setLineDash([]);

            const mx = (s.x + d.x) / 2;
            const my = (s.y + d.y) / 2;
            const R = 6371000;
            const dLat = (destination.lat - source.lat) * Math.PI / 180;
            const dLng = (destination.lng - source.lng) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(source.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
            const dist = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
            ctx.fillStyle = 'rgba(10, 10, 15, 0.85)';
            ctx.fillRect(mx - 30, my - 10, 60, 18);
            ctx.fillStyle = 'rgba(240, 240, 250, 0.7)';
            ctx.font = '10px Inter, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${dist}m`, mx, my + 3);
        }

        // Source marker
        if (source) {
            const { x, y } = toCanvas(source.lat, source.lng);
            ctx.strokeStyle = 'rgba(240, 240, 250, 0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = 'rgba(240, 240, 250, 0.9)';
            ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(240, 240, 250, 0.8)';
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('SOURCE', x + 15, y - 2);
            ctx.font = '9px Inter, monospace';
            ctx.fillStyle = 'rgba(240, 240, 250, 0.5)';
            ctx.fillText(`${source.lat}, ${source.lng}`, x + 15, y + 11);
        }

        // Destination marker
        if (destination) {
            const { x, y } = toCanvas(destination.lat, destination.lng);
            ctx.fillStyle = 'rgba(240, 240, 250, 0.9)';
            ctx.beginPath();
            ctx.moveTo(x, y - 10); ctx.lineTo(x + 8, y); ctx.lineTo(x, y + 10); ctx.lineTo(x - 8, y);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(10, 10, 15, 1)';
            ctx.beginPath();
            ctx.moveTo(x, y - 5); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 5); ctx.lineTo(x - 4, y);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(240, 240, 250, 0.8)';
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('DESTINATION', x + 15, y - 2);
            ctx.font = '9px Inter, monospace';
            ctx.fillStyle = 'rgba(240, 240, 250, 0.5)';
            ctx.fillText(`${destination.lat}, ${destination.lng}`, x + 15, y + 11);
        }

        // Click mode indicator
        ctx.fillStyle = 'rgba(240, 240, 250, 0.3)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`CLICK TO SET: ${clickMode.toUpperCase()}`, drawW - padding, padding - 8);
    }, [source, destination, clickMode]);

    useEffect(() => {
        drawMap();
        const timer = setTimeout(drawMap, 50);
        const handleResize = () => drawMap();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, [drawMap]);

    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const padding = 60;
        const drawW = rect.width;
        const drawH = rect.height;

        if (px < padding || px > drawW - padding || py < padding || py > drawH - padding) return;

        const lng = GEOFENCE.minLng + ((px - padding) / (drawW - padding * 2)) * (GEOFENCE.maxLng - GEOFENCE.minLng);
        const lat = GEOFENCE.maxLat - ((py - padding) / (drawH - padding * 2)) * (GEOFENCE.maxLat - GEOFENCE.minLat);
        const coords = { lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000 };

        onMapClick(coords);
    };

    return (
        <div className="spacex-card p-0 overflow-hidden" style={{ height: '520px' }}>
            <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full h-full cursor-crosshair"
                style={{ display: 'block' }}
            />
        </div>
    );
}
