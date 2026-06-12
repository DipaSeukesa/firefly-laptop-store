import React from 'react';
import { ChevronLeft, Cpu, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BuilderHeader = () => {
    const navigate = useNavigate();
    
    return (
        <div className="flex items-center justify-between mb-10 relative">
            <button 
                onClick={() => navigate('/')} 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 border border-white/5 transition-all active:scale-90"
            >
                <ChevronLeft size={22} />
            </button>

            <div className="text-center flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 bg-cyan-500/10 rounded-lg">
                        <Cpu size={18} className="text-cyan-500 animate-pulse" />
                    </div>
                    <h1 className="text-xl font-black italic text-white uppercase tracking-tighter">
                        PC <span className="text-cyan-500">Configurator</span>
                    </h1>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-0.5 bg-cyan-500/5 rounded-full border border-cyan-500/10">
                    <span className="text-[9px] font-black text-cyan-600 uppercase tracking-wider">
                        Peta Realitas Hardware v1.0
                    </span>
                </div>
            </div>

            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-slate-700">
                <Layers size={16} />
            </div>
        </div>
    );
};

export default BuilderHeader;