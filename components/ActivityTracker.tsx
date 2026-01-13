import React, { useState, useEffect, useRef } from 'react';
import { ActivityType, ActivityLog, UserProfile } from '../types';
import { calculateActivityCalories, haversineDistance } from '../utils/fitnessMath';
import { Play, Square, MapPin, Zap, Activity, Navigation } from 'lucide-react';

interface ActivityTrackerProps {
  onComplete: (log: ActivityLog) => void;
  user: UserProfile;
}

const ActivityTracker: React.FC<ActivityTrackerProps> = ({ onComplete, user }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [type, setType] = useState<ActivityType>('WALKING');
  const [timer, setTimer] = useState(0);
  const [distance, setDistance] = useState(0);
  const [path, setPath] = useState<{ lat: number; lng: number }[]>([]);
  
  const timerRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => stopTracking(false);
  }, []);

  const startTracking = () => {
    setIsTracking(true);
    setTimer(0);
    setDistance(0);
    setPath([]);

    timerRef.current = window.setInterval(() => setTimer(prev => prev + 1), 1000);

    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const newPoint = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          
          setPath(prevPath => {
            const lastPoint = prevPath[prevPath.length - 1];
            if (lastPoint) {
              const d = haversineDistance(lastPoint, newPoint);
              // Filter jitter: threshold 5 meters
              if (d > 0.005) {
                setDistance(prev => prev + d);
                return [...prevPath, newPoint];
              }
              return prevPath;
            }
            return [newPoint];
          });
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }
  };

  const stopTracking = (save: boolean = true) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    
    if (save && isTracking) {
      onComplete({
        id: Math.random().toString(36).substr(2, 9),
        type,
        duration: timer,
        distance,
        caloriesBurned: calculateActivityCalories(type, user.weight, timer),
        timestamp: Date.now(),
        path,
      });
    }

    setIsTracking(false);
    setTimer(0);
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // SVG-based path visualizer for current session
  const renderLivePath = () => {
    if (path.length < 2) return null;
    
    const lats = path.map(p => p.lat);
    const lngs = path.map(p => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const latDiff = maxLat - minLat || 0.001;
    const lngDiff = maxLng - minLng || 0.001;
    
    // Calculate SVG points with padding
    const points = path.map(p => {
      const x = ((p.lng - minLng) / lngDiff) * 220 + 40;
      const y = (1 - (p.lat - minLat) / latDiff) * 220 + 40;
      return `${x},${y}`;
    }).join(' ');

    // Fixed: moved lastCoords declaration outside of the JSX block
    const lastCoords = points.split(' ').pop()?.split(',');

    return (
      <svg viewBox="0 0 300 300" className="w-full h-full opacity-30 absolute inset-0 transition-opacity duration-1000">
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="transition-all duration-300"
        />
        {/* Pulsing indicator at current location */}
        {lastCoords && (
          <circle cx={lastCoords[0]} cy={lastCoords[1]} r="5" fill="#10b981" className="animate-pulse" />
        )}
      </svg>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Activity Type Selection */}
      <div className="flex gap-2 p-1 glass rounded-2xl border border-white/5">
        {(['WALKING', 'RUNNING', 'CYCLING'] as ActivityType[]).map((t) => (
          <button key={t} disabled={isTracking} onClick={() => setType(t)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === t ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500'}`}
          > {t} </button>
        ))}
      </div>

      {/* Visual Tracking Area */}
      <div className="relative h-[300px] w-full rounded-[2rem] overflow-hidden emerald-glow bg-zinc-900 border border-white/5 flex items-center justify-center">
        {renderLivePath()}
        
        {isTracking ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-white relative z-10">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-pulse-ring scale-150" />
              <div className="relative w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
                <Navigation className="text-emerald-500 animate-bounce" size={32} />
              </div>
            </div>
            <p className="font-black text-lg uppercase tracking-widest">Tracking Live</p>
            <p className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-[0.2em] mt-1">Satellite Link Active</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-white">
            <Navigation className="text-zinc-700 mb-2 opacity-30" size={48} />
            <p className="font-bold opacity-30 text-xs uppercase tracking-widest">Awaiting Command</p>
          </div>
        )}
      </div>

      {/* Metrics Board */}
      <div className="glass p-6 rounded-[2rem] text-center border-emerald-500/5">
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Session Timer</p>
        <h2 className="text-5xl font-mono font-black text-emerald-500 mb-6 tabular-nums">{formatTime(timer)}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-500/5 p-4 rounded-2xl border border-white/5">
            <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Distance</p>
            <p className="text-2xl font-black">{distance.toFixed(2)} <span className="text-xs font-normal opacity-50">KM</span></p>
          </div>
          <div className="bg-emerald-500/5 p-4 rounded-2xl border border-white/5">
            <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Burn Est.</p>
            <p className="text-2xl font-black">{calculateActivityCalories(type, user.weight, timer)} <span className="text-xs font-normal opacity-50">KCAL</span></p>
          </div>
        </div>
      </div>

      {/* Control Button */}
      <button onClick={isTracking ? () => stopTracking(true) : startTracking}
        className={`w-full py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all ${isTracking ? 'bg-red-500 text-white shadow-xl' : 'bg-emerald-500 text-black emerald-glow active:scale-95 shadow-xl'}`}
      >
        {isTracking ? <Square fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} />}
        {isTracking ? 'STOP SESSION' : 'START TRACKING'}
      </button>
    </div>
  );
};

export default ActivityTracker;