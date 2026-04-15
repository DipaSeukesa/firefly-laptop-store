import React from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const MonthlyTable = ({ month, logs, isExpanded, onToggle, onDelete, todayStr, activeSession, elapsed }) => {
  
  // Rumus skor tetap sama (berbasis menit)
  const calculateScore = (p, h) => (p * 2) - (h * 2) + ((1440 - p - h) * 1);

  return (
    <div className="space-y-2">
      <button 
        onClick={onToggle}
        className="w-full flex justify-between items-center px-4 py-3 bg-white/5 rounded-2xl border border-white/5"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{month}</span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isExpanded && (
        <div className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40">
          <table className="w-full text-left text-[10px] border-collapse">
            <thead className="bg-white/5 font-black uppercase tracking-tighter text-slate-500">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4 text-center">Focus</th>
                <th className="p-4 text-center">Screen</th>
                <th className="p-4 text-right">Score</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map(log => {
                const isToday = log.tanggal === todayStr;
                let lProd = log.waktu_produktif_menit || 0;
                let lHP = log.waktu_hp_menit || 0;

                // CRITICAL: Ubah elapsed (ms) ke menit sebelum dijumlahkan
                if (isToday && activeSession) {
                  const elapsedMinutes = Math.floor(elapsed / 60000);
                  if (activeSession.mode === 'hp') {
                    lHP += elapsedMinutes;
                  } else {
                    lProd += elapsedMinutes;
                  }
                }

                const score = calculateScore(lProd, lHP);

                return (
                  <tr key={log.id} className={`${isToday ? 'bg-cyan-500/10' : ''} transition-colors`}>
                    <td className="p-4 font-mono text-slate-400">
                      {isToday ? (
                        <span className="flex items-center gap-1.5 text-cyan-500 font-black">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                          </span>
                          TODAY
                        </span>
                      ) : log.tanggal.split('-')[2]}
                    </td>
                    <td className="p-4 text-center font-bold text-cyan-500 italic">
                      {Math.floor(lProd/60)}h {lProd%60}m
                    </td>
                    <td className="p-4 text-center font-bold text-rose-500 italic">
                      {Math.floor(lHP/60)}h {lHP%60}m
                    </td>
                    <td className="p-4 text-right">
                      <span className={`px-2 py-1 rounded font-black font-mono ${score > 1440 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {score}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => onDelete(log.id)} 
                        className="text-slate-700 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MonthlyTable;