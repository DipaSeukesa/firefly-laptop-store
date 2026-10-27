import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, Sparkles, Copy, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

const RealityInsight = ({ stats, assets, getAssetAge }) => {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

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
        location: a.lokasi_penyimpanan || 'Gudang',
        spesifikasi: a.spesifikasi || {},
        has_photo: Boolean(a.foto_url)
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isCritical = stats.aiAnalysis.status === 'KRITIS';
  const healthScore = stats.aiAnalysis.healthScore ?? 100;

  return (
    <div className={`mt-6 border rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${
      isCritical 
        ? 'bg-rose-950/20 border-rose-500/30' 
        : 'bg-slate-900/70 border-slate-800'
    }`}>
      {/* Header Section */}
      <div 
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
        onClick={() => setShowRaw(!showRaw)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isCritical 
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
              : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
          }`}>
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">
                Analisis Inventaris & Rekomendasi (Reality Insight)
              </h4>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                isCritical
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                Skor: {healthScore}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluasi kesehatan stok, perputaran modal, dan unit butuh servis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/60 transition-colors">
            {showRaw ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="hidden sm:inline">{showRaw ? 'Tutup Data AI' : 'Lihat Log AI'}</span>
          </button>
        </div>
      </div>

      {/* Message Summary */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
          isCritical 
            ? 'bg-rose-950/30 border-rose-500/20 text-rose-200' 
            : 'bg-slate-950/60 border-slate-800 text-slate-300'
        }`}>
          {isCritical ? (
            <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold block text-white mb-0.5">Kesimpulan Sistem:</span>
            {stats.aiAnalysis.message}
          </div>
        </div>
      </div>

      {/* Expanded Raw Data (JSON View) */}
      {showRaw && (
        <div className="p-4 sm:p-5 bg-black/70 border-t border-slate-800 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">Context JSON untuk Asisten AI:</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleCopyAI(); }}
              className="px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 rounded-lg text-xs font-bold text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Konteks AI'}</span>
            </button>
          </div>

          <pre className="text-xs font-mono text-cyan-400/90 leading-relaxed overflow-x-auto p-3 rounded-xl bg-slate-950/90 border border-slate-800 max-h-[260px] no-scrollbar">
            {inventorySummary}
          </pre>
        </div>
      )}
    </div>
  );
};

export default RealityInsight;