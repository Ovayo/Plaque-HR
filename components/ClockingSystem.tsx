
import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, MapPin, CheckCircle2 } from 'lucide-react';

interface ClockingSystemProps {
  onClockIn: (location?: { lat: number; lng: number }) => void;
  onClockOut: () => void;
  isClockedIn: boolean;
  startTime?: string;
}

const ClockingSystem: React.FC<ClockingSystemProps> = ({ 
  onClockIn, 
  onClockOut, 
  isClockedIn,
  startTime 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(loc);
          onClockIn(loc);
        },
        () => onClockIn()
      );
    } else {
      onClockIn();
    }
  };

  const calculateDuration = () => {
    if (!startTime) return '00:00:00';
    const start = new Date(startTime);
    const diff = Math.floor((currentTime.getTime() - start.getTime()) / 1000);
    const h = Math.floor(diff / 3600).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-2">
        <Clock size={40} />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-slate-900">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </h2>
        <p className="text-slate-500 font-medium">
          {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {isClockedIn && (
        <div className="bg-emerald-50 text-emerald-700 px-6 py-4 rounded-xl border border-emerald-100 flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-wider mb-1">Time Elapsed</span>
          <span className="text-2xl font-mono font-bold">{calculateDuration()}</span>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <CheckCircle2 size={14} />
            <span>Clocked in at {new Date(startTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      )}

      <div className="flex gap-4 w-full max-w-xs">
        {!isClockedIn ? (
          <button
            onClick={handleClockIn}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Play size={20} fill="currentColor" />
            Clock In
          </button>
        ) : (
          <button
            onClick={onClockOut}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-100 transition-all active:scale-95"
          >
            <Square size={20} fill="currentColor" />
            Clock Out
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <MapPin size={16} />
        {location ? `Tracking: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Location verified via GPS'}
      </div>
    </div>
  );
};

export default ClockingSystem;
