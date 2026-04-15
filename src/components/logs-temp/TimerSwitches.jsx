import React from 'react';
import { Smartphone, Zap } from 'lucide-react';

const TimerSwitches = ({ activeSession, elapsed, onToggle }) => {
  // Helper untuk format mm:ss
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Hitung poin (masih berdasarkan menit untuk konsistensi database)
  const currentMinutes = Math.floor(elapsed / 60000);

  return (
    <div className="grid grid-cols-2 gap-4 mb-10">
      {/* Saklar HP */}
      <button 
        onClick={() => onToggle('hp')}
        className={`p-8 rounded-[3rem] border-2 transition-all relative overflow-hidden ${activeSession?.mode === 'hp' ? 'bg-rose-500/20 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 'bg-slate-900 border-white/5 opacity-40'}`}
      >
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Smartphone size={28} className={activeSession?.mode === 'hp' ? 'text-rose-500 animate-pulse' : 'text-slate-500'} />
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Distraction</p>
            {activeSession?.mode === 'hp' ? (
              <div className="flex flex-col">
                <span className="text-2xl font-black font-mono tracking-tighter">{formatTime(elapsed)}</span>
                <span className="text-[10px] font-bold text-rose-500">-{currentMinutes * 2} pts</span>
              </div>
            ) : <span className="text-[9px] font-bold text-slate-600 italic">Idle</span>}
          </div>
        </div>
      </button>

      {/* Saklar Produktif */}
      <button 
        onClick={() => onToggle('produktif')}
        className={`p-8 rounded-[3rem] border-2 transition-all relative overflow-hidden ${activeSession?.mode === 'produktif' ? 'bg-cyan-500/20 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)]' : 'bg-slate-900 border-white/5 opacity-40'}`}
      >
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Zap size={28} className={activeSession?.mode === 'produktif' ? 'text-cyan-500 animate-bounce' : 'text-slate-500'} />
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Deep Work</p>
            {activeSession?.mode === 'produktif' ? (
              <div className="flex flex-col">
                <span className="text-2xl font-black font-mono tracking-tighter">{formatTime(elapsed)}</span>
                <span className="text-[10px] font-bold text-cyan-500">+{currentMinutes * 2} pts</span>
              </div>
            ) : <span className="text-[9px] font-bold text-slate-600 italic">Idle</span>}
          </div>
        </div>
      </button>
    </div>
  );
};

export default TimerSwitches;