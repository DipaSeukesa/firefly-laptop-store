import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Target, Zap } from 'lucide-react';

import GoalCard from '../components/Goals/GoalCard';
import GoalModal from '../components/Goals/GoalModal';
import RealityGoals from '../components/Goals/RealityGoals';

const Goals = () => {
    const navigate = useNavigate();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Deklarasi formData cukup sekali di sini sesuai kolom DB
    const [formData, setFormData] = useState({
        nama_goal: '',
        category: 'Asset',
        priority_level: 3,
        target_akhir: 0,
        current_amount: 0,
        satuan: 'Rupiah',
        deadline: '',
        catatan_strategis: '',
        is_active: true
    });

    // Fungsi Reset Form setelah simpan
    const resetForm = () => {
        setFormData({
            nama_goal: '',
            category: 'Asset',
            priority_level: 3,
            target_akhir: 0,
            current_amount: 0,
            satuan: 'Rupiah',
            deadline: '',
            catatan_strategis: '',
            is_active: true
        });
    };

    useEffect(() => { fetchGoals(); }, []);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from('goals').select('*').order('deadline', { ascending: true });
            if (error) throw error;
            setGoals(data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('goals').insert([formData]);

        if (!error) {
            setShowModal(false);
            setFormData({ nama_goal: '', target_akhir: 0, satuan: '', deadline: '', is_active: true });
            fetchGoals();
        } else {
            alert("Gagal mengirim data: " + error.message);
        }
    };

    const deleteGoal = async (id) => {
        if (window.confirm("Hapus target visi ini?")) {
            await supabase.from('goals').delete().eq('id', id);
            fetchGoals();
        }
    };

    // Logic progress (karena di DB kamu belum ada current_amount, kita asumsikan 0 dulu atau sesuaikan nanti)
    const totalProgress = useMemo(() => {
        if (goals.length === 0) return 0;
        // Sementara kita hitung berapa yang active (is_active)
        const activeGoals = goals.filter(g => g.is_active).length;
        return Math.round((activeGoals / goals.length) * 100);
    }, [goals]);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 pb-32">
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full text-slate-400">
                    <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                    <h1 className="text-lg font-black italic text-emerald-500 uppercase tracking-tighter flex items-center gap-2">
                        <Target size={18} /> Vision Goals
                    </h1>
                    <p className="text-[8px] text-slate-500 uppercase tracking-widest">Growth Tracking System</p>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 p-6 rounded-[2.5rem] mb-8 relative overflow-hidden">
                <Zap className="absolute -right-4 -top-4 text-emerald-500/10" size={120} />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Overall Vision Progress</p>
                <div className="flex items-baseline gap-2 mb-4">
                    <h2 className="text-4xl font-black text-white">{totalProgress}%</h2>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase italic">Active Status</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${totalProgress}%` }}></div>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <p className="text-center text-slate-600 text-xs animate-pulse">Syncing visions...</p>
                ) : (
                    goals.map(goal => (
                        <GoalCard key={goal.id} goal={goal} onDelete={deleteGoal} />
                    ))
                )}
            </div>

            <RealityGoals goals={goals} />

            <button onClick={() => setShowModal(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg z-40 active:scale-90 transition-transform">
                <Plus size={28} />
            </button>

            <GoalModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
            />
        </div>
    );
};

export default Goals;