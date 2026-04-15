import React from 'react';
import { TrendingUp, Target, AlertCircle } from 'lucide-react';

const AssetStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="bg-slate-900 border border-white/5 p-4 rounded-[2rem] relative overflow-hidden">
        <TrendingUp className="text-emerald-500 mb-2" size={16} />
        <p className="text-[9px] text-slate-500 uppercase font-black">Modal Terikat</p>
        <p className="text-sm font-mono font-bold">Rp {stats.totalModal.toLocaleString()}</p>
        {stats.needsService > 0 && (
          <div className="absolute top-2 right-4 flex items-center gap-1 text-[8px] text-rose-500 font-bold animate-pulse">
            <AlertCircle size={10} /> {stats.needsService} SERVIS
          </div>
        )}
      </div>
      <div className="bg-slate-900 border border-white/5 p-4 rounded-[2rem]">
        <Target className="text-cyan-500 mb-2" size={16} />
        <p className="text-[9px] text-slate-500 uppercase font-black">Potensi Profit L1</p>
        <p className="text-sm font-mono font-bold text-cyan-400">Rp {stats.potentialProfit.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default AssetStats;