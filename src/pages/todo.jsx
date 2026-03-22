import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, Trash2, Sparkles, Star, ChevronLeft, X, 
  LayoutGrid, ChevronDown, ListTree, Target, AlignLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Todo = () => {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('focus'); 
  const [showModal, setShowModal] = useState(false);
  
  // State tambahan untuk tracking task mana yang sedang diedit detailnya
  const [activeDetailId, setActiveDetailId] = useState(null);

  // 1. STATE UNTUK SHOW/HIDE FOLDER & TUGAS SELESAI
  const [expandedCats, setExpandedCats] = useState({ Sekolah: true, Usaha: true, Rumah: true, Umum: true });
  const [showDone, setShowDone] = useState({ Sekolah: false, Usaha: false, Rumah: false, Umum: false });

  const [formData, setFormData] = useState({
    task: '',
    due_date: new Date().toISOString().split('T')[0],
    category: 'Umum',
    parent_id: null,
    notes: '' // Tambah notes di form
  });

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('todos').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      setTodos(data || []);
    } catch (err) { console.error(err.message); } finally { setLoading(false); }
  };

  // 2. LOGIKA FILTRASI & PROGRESS
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const focusTasks = todos.filter(t => t.is_starred || t.due_date === today || t.due_date === tomorrowStr);
    const mainTasks = todos.filter(t => !t.parent_id);
    const subTasks = todos.filter(t => t.parent_id);
    const completed = focusTasks.filter(t => t.is_completed).length;
    const percentage = focusTasks.length > 0 ? Math.round((completed / focusTasks.length) * 100) : 0;
    return { focusTasks, mainTasks, subTasks, percentage, today, tomorrowStr };
  }, [todos]);

  // 3. ACTIONS (UPDATE, DELETE, SAVE)
  const handleSave = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('todos').insert([formData]);
    if (!error) {
      setShowModal(false);
      setFormData({ ...formData, task: '', parent_id: null, notes: '' });
      fetchTodos();
    }
  };

  const updateField = async (id, field, value) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    await supabase.from('todos').update({ [field]: value }).eq('id', id);
  };

  const handleDrop = async (e, targetCategory) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData("todoId");
    if (!todoId) return;
    setTodos(prev => prev.map(t => t.id === todoId ? { ...t, category: targetCategory } : t));
    const { error } = await supabase.from('todos').update({ category: targetCategory }).eq('id', todoId);
    if (error) fetchTodos();
  };

  const toggleStatus = async (id, current) => {
    await supabase.from('todos').update({ is_completed: !current }).eq('id', id);
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    if (window.confirm("Hapus tugas ini?")) {
      await supabase.from('todos').delete().eq('id', id);
      fetchTodos();
    }
  };

  // 4. RENDER TASK (INLINE EDITABLE)
const renderTask = (todo, isSub = false) => {
    const isToday = todo.due_date === stats.today;
    const isH1 = todo.due_date === stats.tomorrowStr && !todo.is_completed;
    const taskSubTasks = stats.subTasks.filter(st => st.parent_id === todo.id);
    const isEditingDetail = activeDetailId === todo.id;
  
    // FUNGSI BARU: TAMBAH SUBTASK INSTAN TANPA MODAL
    const handleAddSubTask = async () => {
      const newSubTask = {
        task: 'Langkah baru...', // Judul default agar bisa langsung diklik & edit
        category: todo.category,
        parent_id: todo.id,
        due_date: todo.due_date,
        is_completed: false
      };
  
      const { data, error } = await supabase.from('todos').insert([newSubTask]).select();
      if (!error && data) {
        await fetchTodos();
        // Opsional: Langsung fokus ke detail subtask yang baru dibuat
        setActiveDetailId(data[0].id); 
      }
    };
  
    return (
      <div 
        key={todo.id} 
        draggable={!isSub}
        onDragStart={(e) => e.dataTransfer.setData("todoId", todo.id)}
        className={`group mb-2 transition-all ${isSub ? 'ml-6 mt-1' : 'cursor-grab active:cursor-grabbing'}`}
      >
        <div className={`p-3 rounded-2xl border transition-all ${
          todo.is_completed ? 'bg-slate-900/40 border-white/5 opacity-60' : 'bg-slate-900 border-white/10'
        }`}>
          <div className="flex items-start gap-3">
            <button onClick={() => toggleStatus(todo.id, todo.is_completed)} 
              className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                todo.is_completed ? 'bg-indigo-500 border-indigo-500' : 'border-white/20 hover:border-indigo-500'
              }`}>
              {todo.is_completed && <Plus size={14} className="text-white rotate-45" strokeWidth={4} />}
            </button>
    
            <div className="flex-1 min-w-0" onClick={() => setActiveDetailId(isEditingDetail ? null : todo.id)}>
              <input 
                type="text" 
                value={todo.task} 
                onClick={(e) => e.stopPropagation()} 
                onChange={(e) => updateField(todo.id, 'task', e.target.value)}
                className={`w-full bg-transparent border-none outline-none p-0 text-sm font-bold focus:ring-0 ${
                  todo.is_completed ? 'line-through text-slate-500' : 'text-slate-200'
                }`} 
              />
              
              {(todo.notes || isEditingDetail) && (
                <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                  {isEditingDetail ? (
                    <textarea
                      autoFocus
                      placeholder="Tambahkan detail..."
                      value={todo.notes || ''}
                      onChange={(e) => updateField(todo.id, 'notes', e.target.value)}
                      onBlur={() => setActiveDetailId(null)}
                      className="w-full bg-white/5 text-[11px] text-slate-400 border-none outline-none p-2 rounded-lg focus:ring-1 focus:ring-indigo-500 min-h-[60px] resize-none"
                    />
                  ) : (
                    <p className="text-[10px] text-slate-500 line-clamp-2 pl-1 italic">
                      {todo.notes}
                    </p>
                  )}
                </div>
              )}
  
              <div className="relative inline-block mt-1">
                <button onClick={(e) => { e.stopPropagation(); e.currentTarget.nextElementSibling.showPicker(); }}
                  className={`text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest ${
                    isH1 ? 'bg-rose-500 text-white animate-pulse' : isToday ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-500'
                  }`}>
                  {isH1 ? 'BESOK' : isToday ? 'HARI INI' : todo.due_date}
                </button>
                <input type="date" className="absolute opacity-0 w-0 h-0" value={todo.due_date || ''} 
                  onChange={(e) => updateField(todo.id, 'due_date', e.target.value)} />
              </div>
            </div>
    
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); updateField(todo.id, 'is_starred', !todo.is_starred); }} 
                className={todo.is_starred ? 'text-amber-400' : 'text-slate-600'}><Star size={16} fill={todo.is_starred ? "currentColor" : "none"} /></button>
              <button onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }} className="text-slate-600 hover:text-rose-500"><Trash2 size={16}/></button>
            </div>
          </div>
        </div>
  
        {!isSub && activeTab === 'all' && (
          <div className="ml-4 border-l border-white/5 pl-4">
            {taskSubTasks.map(st => renderTask(st, true))}
            {/* BUTTON DIUBAH DISINI: LANGSUNG PANGGIL handleAddSubTask */}
            <button 
              onClick={handleAddSubTask}
              className="text-[9px] font-bold text-slate-600 hover:text-indigo-400 py-1 transition-colors uppercase italic"
            >
              + Tambah Langkah
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans">
      {/* 5. HEADER & PROGRESS */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/admin/dashboard')} className="p-2 bg-white/5 rounded-full text-slate-400"><ChevronLeft size={20}/></button>
        <div className="text-center">
          <h1 className="text-lg font-black italic text-indigo-500">TASK MASTER</h1>
          <p className="text-[8px] text-slate-500 uppercase tracking-widest">Firefly Store Ecosystem</p>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="bg-slate-900 border border-white/10 p-6 rounded-[2.5rem] mb-8 flex items-center gap-6">
        <div className="relative w-20 h-20 flex-shrink-0">
           <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="3"></circle>
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-indigo-500" strokeWidth="3" strokeDasharray={`${stats.percentage}, 100`} strokeLinecap="round"></circle>
           </svg>
           <div className="absolute inset-0 flex items-center justify-center font-black text-sm">{stats.percentage}%</div>
        </div>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2"><Sparkles className="text-amber-400" size={18}/> Fokus Strategis</h2>
          <p className="text-slate-400 text-xs">Selesaikan tugas prioritas Anda hari ini.</p>
        </div>
      </div>

      {/* 6. TABS NAVIGATION */}
      <div className="flex gap-2 mb-6">
        {['focus', 'all'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} 
            className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500'
            }`}> {tab === 'focus' ? 'Fokus' : 'Semua Rencana'}</button>
        ))}
      </div>

      {/* 7. DAFTAR TUGAS DENGAN GROUPING KATEGORI */}
      <div className="max-w-3xl mx-auto space-y-4">
        {activeTab === 'focus' ? (
          stats.focusTasks.map(t => renderTask(t))
        ) : (
          ['Sekolah', 'Usaha', 'Rumah', 'Umum'].map(cat => {
            const catTasks = stats.mainTasks.filter(t => t.category === cat);
            const activeTasks = catTasks.filter(t => !t.is_completed);
            const doneTasks = catTasks.filter(t => t.is_completed);

            return (
              <div 
                key={cat} 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, cat)}
                className="bg-slate-900/30 rounded-3xl border border-white/5 overflow-hidden transition-colors hover:border-indigo-500/30"
              >
                <button onClick={() => setExpandedCats(p => ({...p, [cat]: !p[cat]}))}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <LayoutGrid size={16} className={expandedCats[cat] ? 'text-indigo-400' : 'text-slate-600'}/>
                    <span className={`text-xs font-black uppercase tracking-widest ${expandedCats[cat] ? 'text-white' : 'text-slate-500'}`}>{cat === 'Umum' ? 'LAINNYA' : cat}</span>
                  </div>
                  <ChevronDown size={16} className={`transition-transform ${expandedCats[cat] ? '' : '-rotate-90 text-slate-700'}`}/>
                </button>

                {expandedCats[cat] && (
                  <div className="p-3 pt-0 space-y-1">
                    {activeTasks.map(t => renderTask(t))}
                    {doneTasks.length > 0 && (
                      <div className="mt-2">
                        <button onClick={() => setShowDone(p => ({...p, [cat]: !p[cat]}))}
                          className="flex items-center gap-2 text-[9px] font-black text-slate-600 p-2 uppercase">
                          {showDone[cat] ? 'Sembunyikan' : 'Lihat'} {doneTasks.length} Tugas Selesai
                        </button>
                        {showDone[cat] && doneTasks.map(t => renderTask(t))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 8. FAB & MODAL */}
      <button onClick={() => setShowModal(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg z-40"><Plus size={28}/></button>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[2rem] p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">Buat Rencana</h3>
              <button onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <input required type="text" placeholder="Tugas baru..." className="w-full bg-slate-800 p-4 rounded-xl outline-none border border-white/5 focus:border-indigo-500"
                value={formData.task} onChange={e => setFormData({...formData, task: e.target.value})} />
              
              <textarea 
                placeholder="Tambahkan detail (opsional)..." 
                className="w-full bg-slate-800 p-4 rounded-xl outline-none border border-white/5 focus:border-indigo-500 min-h-[80px] text-xs text-slate-400"
                value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
              />

              <div className="grid grid-cols-2 gap-2">
                {['Sekolah', 'Usaha', 'Rumah', 'Umum'].map(c => (
                  <button key={c} type="button" onClick={() => setFormData({...formData, category: c})}
                    className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${formData.category === c ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-slate-800 border-transparent text-slate-500'}`}>
                    {c === 'Umum' ? 'LAINNYA' : c}
                  </button>
                ))}
              </div>
              <button className="w-full bg-indigo-500 py-4 rounded-xl font-bold text-xs uppercase tracking-widest mt-2">Simpan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Todo;