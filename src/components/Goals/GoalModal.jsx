import React from 'react';
import { X, Trophy, Target, Zap } from 'lucide-react';

const GoalModal = ({ isOpen, onClose, formData, setFormData, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[2.5rem] p-6 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Trophy className="text-emerald-500" size={20} />
            </div>
            <h3 className="font-bold text-white italic uppercase tracking-tight">Vision Tuning</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-4">
          {/* NAMA GOAL */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Goal Name</label>
            <input 
              required 
              placeholder="e.g., Upgrade Kamera L1" 
              className="w-full bg-slate-800/50 p-4 rounded-2xl outline-none border border-white/5 focus:border-emerald-500 text-sm transition-all text-white" 
              value={formData.nama_goal} 
              onChange={e => setFormData({...formData, nama_goal: e.target.value})} 
            />
          </div>

          {/* KATEGORI & PRIORITAS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Kategori</label>
              <select 
                className="w-full bg-slate-800/50 p-4 rounded-2xl outline-none border border-white/5 focus:border-emerald-500 text-xs text-slate-300 appearance-none"
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="Asset">Asset</option>
                <option value="Financial">Financial</option>
                <option value="Growth">Growth</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Prioritas (1-5)</label>
              <input 
                type="number" min="1" max="5"
                className="w-full bg-slate-800/50 p-4 rounded-2xl outline-none border border-white/5 focus:border-emerald-500 text-sm font-mono text-amber-400" 
                value={formData.priority_level} 
                onChange={e => setFormData({...formData, priority_level: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* TARGET AKHIR */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Target Akhir</label>
              <input 
                type="number" required 
                className="w-full bg-slate-800/50 p-4 rounded-2xl outline-none border border-white/5 focus:border-emerald-500 text-sm font-mono text-emerald-400" 
                value={formData.target_akhir} 
                onChange={e => setFormData({...formData, target_akhir: e.target.value})} 
              />
            </div>
            {/* CURRENT PROGRESS */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Posisi Saat Ini</label>
              <input 
                type="number"
                className="w-full bg-slate-800/50 p-4 rounded-2xl outline-none border border-white/5 focus:border-emerald-500 text-sm font-mono text-cyan-400" 
                value={formData.current_amount} 
                onChange={e => setFormData({...formData, current_amount: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             {/* SATUAN */}
             <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Satuan</label>
              <input 
                required placeholder="Rupiah"
                className="w-full bg-slate-800/50 p-4 rounded-2xl outline-none border border-white/5 focus:border-emerald-500 text-sm text-slate-300" 
                value={formData.satuan} 
                onChange={e => setFormData({...formData, satuan: e.target.value})} 
              />
            </div>
            {/* DEADLINE */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest">Deadline</label>
              <input 
                type="date" required 
                className="w-full bg-slate-800/50 p-4 rounded-2xl outline-none border border-white/5 focus:border-emerald-500 text-xs text-slate-300" 
                value={formData.deadline} 
                onChange={e => setFormData({...formData, deadline: e.target.value})} 
              />
            </div>
          </div>

          {/* CATATAN STRATEGIS UNTUK AI */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase ml-2 tracking-widest tracking-widest flex items-center gap-1">
              <Zap size={10} className="text-purple-400" /> Catatan Strategis (AI Context)
            </label>
            <textarea 
              placeholder="Jelaskan alasan atau strategi singkat agar AI bisa menganalisis..." 
              className="w-full bg-slate-800/50 p-4 rounded-2xl outline-none border border-white/5 focus:border-purple-500 text-xs text-slate-300 min-h-[80px] no-scrollbar"
              value={formData.catatan_strategis} 
              onChange={e => setFormData({...formData, catatan_strategis: e.target.value})} 
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-900/20 active:scale-95 transition-all mt-2"
          >
            Lock Vision Target
          </button>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;