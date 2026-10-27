import React from 'react';
import { TrendingUp, Target, AlertTriangle, ShieldCheck, ArrowUpRight } from 'lucide-react';

const AssetStats = ({ stats }) => {
  const filteredList = stats.filtered || [];
  const totalUnits = filteredList.reduce((acc, curr) => acc + (curr.qty || 1), 0);
  const totalItems = filteredList.length;

  const isCritical = stats.aiAnalysis?.status === 'KRITIS';
  const healthScore = stats.aiAnalysis?.healthScore ?? 100;
  const needsService = stats.needsService || 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl mb-6 backdrop-blur-md overflow-hidden shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
        
        {/* ZONA 1: MODAL TERIKAT (KOLOM LEBAR / UTAMA) */}
        <div className="md:col-span-4 p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-950/60">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <TrendingUp size={14} className="text-emerald-400" />
              Modal Terikat
            </span>
            <span className="text-[11px] font-mono text-slate-500 font-normal">
              {totalUnits} Unit ({totalItems} Jenis)
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              Rp {Number(stats.totalModal || 0).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Akumulasi nilai modal seluruh inventaris
            </p>
          </div>
        </div>

        {/* ZONA 2: POTENSI PROFIT L1 */}
        <div className="md:col-span-3 p-4 sm:p-5 flex flex-col justify-between bg-slate-900/50">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Target size={14} className="text-cyan-400" />
              Target Profit L1
            </span>
            <ArrowUpRight size={14} className="text-cyan-400 opacity-60" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-400 tracking-tight">
              +Rp {Number(stats.potentialProfit || 0).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Margin kotor laptop & dagangan utama
            </p>
          </div>
        </div>

        {/* ZONA 3: KESEHATAN INVENTARIS */}
        <div className="md:col-span-3 p-4 sm:p-5 flex flex-col justify-between bg-slate-900/30">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className={isCritical ? "text-rose-400" : "text-emerald-400"} />
              Kesehatan Stok
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isCritical ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              {stats.aiAnalysis?.status || 'OPTIMAL'}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-mono font-bold text-white">{healthScore}%</span>
              {/* Mini visual bar */}
              <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-rose-500' : 'bg-emerald-400'}`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {stats.aiAnalysis?.ratio || 'Distribusi Seimbang'}
            </p>
          </div>
        </div>

        {/* ZONA 4: ALERT / PERINGATAN OPERASIONAL */}
        <div className={`md:col-span-2 p-4 sm:p-5 flex flex-col justify-between ${
          needsService > 0 ? 'bg-rose-950/20 text-rose-300' : 'bg-slate-900/20 text-slate-400'
        }`}>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2">
            <AlertTriangle size={14} className={needsService > 0 ? "text-rose-400 animate-pulse" : "text-slate-500"} />
            <span>Status Unit</span>
          </div>
          <div>
            <div className={`text-base sm:text-lg font-mono font-bold ${needsService > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {needsService > 0 ? `${needsService} Servis` : 'Normal'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {needsService > 0 ? 'Perlu tindakan' : 'Semua unit siap'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AssetStats;