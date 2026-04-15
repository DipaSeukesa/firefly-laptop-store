import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, Activity, Zap } from 'lucide-react';

const RealityGoals = ({ goals }) => {
  const [showRaw, setShowRaw] = useState(false);

  const realitySummary = useMemo(() => {
    if (!goals || goals.length === 0) return "No vision data available.";
    
    const now = new Date();
    
    const summary = {
      reality_timestamp: now.toLocaleString('id-ID'),
      status_umum: {
        total_vision: goals.length,
        active_vision: goals.filter(g => g.is_active).length,
        high_priority_count: goals.filter(g => g.priority_level >= 4).length,
      },
      // Inilah "Bahan Bakar" utama AI Advisor
      engine_analysis: goals
        .filter(g => g.is_active)
        .map(g => {
          const sisaHari = Math.ceil((new Date(g.deadline) - now) / (1000 * 60 * 60 * 24));
          const sisaTarget = Number(g.target_akhir) - Number(g.current_amount);
          const bebanHarian = sisaHari > 0 ? (sisaTarget / sisaHari).toFixed(2) : sisaTarget;
          
          return {
            goal: g.nama_goal,
            category: g.category,
            priority: g.priority_level, // Tambahan vital
            urgency: sisaHari <= 7 ? 'CRITICAL' : sisaHari <= 30 ? 'WARNING' : 'SAFE',
            metrics: {
                sisa_hari: sisaHari,
                quota_harian: `${bebanHarian} ${g.satuan}/hari`,
                progress: `${Math.round((g.current_amount / g.target_akhir) * 100)}%`
            },
            strategic_note: g.catatan_strategis || "No specific instruction provided." // Tambahan vital
          };
        }),
      energy_distribution: goals.reduce((acc, g) => {
        acc[g.category] = (acc[g.category] || 0) + 1;
        return acc;
      }, {}),
      ai_instruction_override: "Prioritize schedule based on priority level and daily_quota. If status is SAFE, focus on quality and system stability."
    };

    return JSON.stringify(summary, null, 2);
  }, [goals]);

  return (
    <div className="mt-6 bg-slate-900/50 border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all active:scale-[0.98]"
        onClick={() => setShowRaw(!showRaw)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500">
            <Activity size={18} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Reality Engine Output</h4>
            <div className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></span>
                <p className="text-[9px] text-slate-500 uppercase font-bold">AI Feed Live Monitor</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600 font-mono italic">
                {showRaw ? 'CLOSE_STREAM' : 'READ_DATA'}
            </span>
            <button className="text-slate-500">
            {showRaw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
      </div>

      {showRaw && (
        <div className="p-4 bg-black/60 border-t border-white/5 relative">
          <div className="absolute top-2 right-4 flex gap-2">
             <Zap size={12} className="text-amber-500 animate-pulse" />
          </div>
          <pre className="text-[10px] font-mono text-emerald-500/90 leading-relaxed overflow-x-auto no-scrollbar py-2">
            {realitySummary}
          </pre>
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
            <span className="text-[8px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded-md font-black uppercase tracking-widest">
              Ready for AI Prompting
            </span>
            <span className="text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded-md font-black uppercase tracking-widest">
              Context Injected
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealityGoals;