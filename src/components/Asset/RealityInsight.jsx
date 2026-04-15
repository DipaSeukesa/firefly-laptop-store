import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, Activity, Zap, PackageSearch } from 'lucide-react';

const RealityInsight = ({ stats, assets, getAssetAge }) => {
  const [showRaw, setShowRaw] = useState(false);

  // Mengubah data inventaris menjadi format JSON yang disukai AI
  const inventorySummary = useMemo(() => {
    const masalahStok = assets
      .filter(a => (getAssetAge(a.created_at) > 30 && a.status_barang === 'Tersedia') || a.status_barang === 'Servis')
      .map(a => ({
        unit: a.nama_barang,
        id: a.kode_unit || 'No-ID',
        layer: `L${a.kategori_layer}`,
        age_days: getAssetAge(a.created_at),
        financials: {
          cost: Number(a.harga_modal),
          target: Number(a.harga_jual_target),
          potential_margin: Number(a.harga_jual_target) - Number(a.harga_modal)
        },
        status: a.status_barang,
        condition: a.kondisi,
        location: a.lokasi_penyimpanan || 'Gudang'
      }));

    const summary = {
      reality_timestamp: new Date().toLocaleString('id-ID'),
      warehouse_stats: {
        total_capital: stats.totalModal,
        l1_potential_profit: stats.potentialProfit,
        health_score: `${stats.aiAnalysis.healthScore}%`,
        system_status: stats.aiAnalysis.status
      },
      priority_items: masalahStok,
      system_conclusion: stats.aiAnalysis.message,
      ai_context_guideline: "Identifikasi sinergi antara stok lama (aged inventory) dengan target finansial saat ini. Seimbangkan antara likuidasi aset lama dengan pengambilan peluang pertumbuhan (growth) yang baru."
    };

    return JSON.stringify(summary, null, 2);
  }, [stats, assets, getAssetAge]);

  const handleCopyAI = () => {
    navigator.clipboard.writeText(inventorySummary);
    alert("Warehouse Context Injected to Clipboard!");
  };

  return (
    <div className={`mt-6 border rounded-[2rem] overflow-hidden shadow-xl transition-all duration-500 ${
      stats.aiAnalysis.status === 'KRITIS' 
        ? 'bg-rose-950/20 border-rose-500/20' 
        : 'bg-slate-900/50 border-white/5'
    }`}>
      {/* Header Section */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
        onClick={() => setShowRaw(!showRaw)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            stats.aiAnalysis.status === 'KRITIS' ? 'bg-rose-500/20 text-rose-500' : 'bg-cyan-500/20 text-cyan-500'
          }`}>
            <PackageSearch size={18} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest text-left">Warehouse Reality Check</h4>
            <div className="flex items-center gap-1">
              <span className={`w-1 h-1 rounded-full animate-ping ${
                stats.aiAnalysis.status === 'KRITIS' ? 'bg-rose-500' : 'bg-emerald-500'
              }`}></span>
              <p className="text-[9px] text-slate-500 uppercase font-bold">Health Score: {stats.aiAnalysis.healthScore}%</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600 font-mono italic">
            {showRaw ? 'HIDE_DETAILS' : 'EXPAND_LOG'}
          </span>
          <button className="text-slate-500">
            {showRaw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Message Summary */}
      {!showRaw && (
        <div className="px-4 pb-4">
          <p className="text-[11px] text-slate-400 italic leading-relaxed border-l-2 border-white/10 pl-3">
            "{stats.aiAnalysis.message}"
          </p>
        </div>
      )}

      {/* Expanded Raw Data (JSON View) */}
      {showRaw && (
        <div className="p-4 bg-black/60 border-t border-white/5 relative">
          <div className="absolute top-2 right-4 flex gap-2">
             <Zap size={12} className="text-amber-500 animate-pulse" />
          </div>
          <pre className="text-[10px] font-mono text-cyan-400/90 leading-relaxed overflow-x-auto no-scrollbar py-2 max-h-[300px]">
            {inventorySummary}
          </pre>
          
          <div className="mt-4 flex flex-col gap-3 pt-3 border-t border-white/5">
            <button 
              onClick={(e) => { e.stopPropagation(); handleCopyAI(); }}
              className="w-full bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 py-3 rounded-xl transition-all active:scale-95 group"
            >
              <span className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.1em] group-hover:tracking-[0.2em] transition-all">
                Copy Warehouse Context for AI
              </span>
            </button>
            
            <div className="flex gap-2">
              <span className="text-[8px] bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-2 py-1 rounded-md font-black uppercase tracking-widest">
                Raw Feed
              </span>
              <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded-md font-black uppercase tracking-widest">
                Stok Lama Terdeteksi
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealityInsight;