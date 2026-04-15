import React from 'react';
import { Target, Trash2, Calendar, Flag, CheckCircle2 } from 'lucide-react';

const GoalCard = ({ goal, onDelete }) => {
  // Menghitung progress berdasarkan target_akhir
  // Karena di DB belum ada current_amount, kita asumsikan jika is_active false = 100%, 
  // atau kamu bisa set default ke 0 jika belum ada kolom progress di DB.
  const current = goal.current_amount || 0; // Fallback jika nanti kamu tambah kolom ini
  const target = goal.target_akhir || 0;
  const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return (
    <div className="bg-slate-900 border border-white/5 p-5 rounded-[2.5rem] group hover:border-emerald-500/30 transition-all relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Target size={100} />
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`p-2 rounded-xl ${goal.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-700/50 text-slate-500'}`}>
              <Target size={16} />
            </div>
            <h3 className="font-bold text-slate-200 tracking-tight">{goal.nama_goal}</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
              Deadline: {goal.deadline ? new Date(goal.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Limit'}
            </p>
            {!goal.is_active && (
              <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">Selesai</span>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => onDelete(goal.id)} 
          className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Target Pencapaian</p>
            <p className="text-sm font-mono font-bold text-white">
              {Number(target).toLocaleString('id-ID')} <span className="text-emerald-500 text-[10px]">{goal.satuan || 'Unit'}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-emerald-400">{progress}%</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${
              progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-600 to-cyan-500'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-[9px] text-slate-500 uppercase font-bold">
            <Calendar size={10} className="text-slate-600" /> 
            {goal.satuan ? `Tracking by ${goal.satuan}` : 'General Goal'}
          </div>
        </div>
        
        <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter ${goal.is_active ? 'text-cyan-500' : 'text-emerald-500'}`}>
          {goal.is_active ? (
            <> <Flag size={10} /> In Progress </>
          ) : (
            <> <CheckCircle2 size={10} /> Goal Achieved </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalCard;