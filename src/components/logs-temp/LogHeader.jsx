import React from 'react';
import { ChevronLeft, Activity, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LogHeader = () => {
    const navigate = useNavigate();
    
    // Format tanggal Indonesia (Contoh: Rabu, 15 April 2026)
    const today = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(new Date());

    return (
        <div className="flex items-center justify-between mb-10 relative">
            {/* Tombol Back dengan Efek Glass */}
            <button 
                onClick={() => navigate('/')} 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 border border-white/5 transition-all active:scale-90"
            >
                <ChevronLeft size={22} />
            </button>

            {/* Judul Pusat */}
            <div className="text-center flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 bg-cyan-500/10 rounded-lg">
                        <Activity size={18} className="text-cyan-500 animate-pulse" />
                    </div>
                    <h1 className="text-xl font-black italic text-white uppercase tracking-tighter">
                        Audit <span className="text-cyan-500">Performa</span>
                    </h1>
                </div>
                
                {/* Badge Tanggal & Tagline */}
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5 px-3 py-0.5 bg-cyan-500/5 rounded-full border border-cyan-500/10">
                        <Calendar size={10} className="text-cyan-600" />
                        <span className="text-[9px] font-black text-cyan-600 uppercase tracking-wider">
                            {today}
                        </span>
                    </div>
                    <p className="text-[7px] text-slate-600 uppercase tracking-[0.4em] font-bold mt-1">
                        Sistem Otomatis • Tanpa Input Manual
                    </p>
                </div>
            </div>

            {/* Spacer Seimbang (Bisa diisi Profil/Avatar nantinya) */}
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-slate-700">
                <Activity size={16} />
            </div>
        </div>
    );
};

export default LogHeader;