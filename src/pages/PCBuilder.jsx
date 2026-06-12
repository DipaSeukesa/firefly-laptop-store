import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import BuilderHeader from '../components/PCBuilder/BuilderHeader';
import BuilderSummary from '../components/PCBuilder/BuilderSummary';
import { Cpu, Monitor, HardDrive, Zap, Layout, Wind, Box, Disc } from 'lucide-react';

const PCBuilder = () => {
    const [parts, setParts] = useState([]);
    const [serviceFee, setServiceFee] = useState(150000); // Default jasa rakit
    const [selectedParts, setSelectedParts] = useState({
        CPU: null, Motherboard: null, RAM: null, GPU: null,
        Storage: null, PSU: null, Cooler: null, Case: null, 
        Fan: null, Monitor: null
    });

    useEffect(() => {
        const fetchParts = async () => {
            const { data } = await supabase.from('pc_parts').select('*');
            if (data) setParts(data);
        };
        fetchParts();
    }, []);

    // Filter Logic (Peta Realitas)
    const filteredParts = useMemo(() => {
        return {
            CPU: parts.filter(p => p.category === 'CPU'),
            Motherboard: parts.filter(p => p.category === 'Motherboard' && 
                (!selectedParts.CPU || p.socket_type === selectedParts.CPU.socket_type)),
            RAM: parts.filter(p => p.category === 'RAM' && 
                (!selectedParts.Motherboard || p.ram_type === selectedParts.Motherboard.ram_type)),
            GPU: parts.filter(p => p.category === 'GPU'),
            Storage: parts.filter(p => p.category === 'Storage'),
            PSU: parts.filter(p => p.category === 'PSU'),
            Cooler: parts.filter(p => p.category === 'Cooler' && 
                (!selectedParts.CPU || p.socket_type.includes(selectedParts.CPU.socket_type))),
            Case: parts.filter(p => p.category === 'Case'),
            Fan: parts.filter(p => p.category === 'Fan'),
            Monitor: parts.filter(p => p.category === 'Monitor'),
        };
    }, [parts, selectedParts]);

    const totals = useMemo(() => {
        const selectedArray = Object.values(selectedParts).filter(p => p !== null);
        const cost = selectedArray.reduce((acc, curr) => acc + Number(curr.price_cost), 0);
        const sale = selectedArray.reduce((acc, curr) => acc + Number(curr.price_sale), 0);
        const watt = selectedArray.reduce((acc, curr) => acc + (curr.wattage || 0), 0);
        return { cost, sale, watt, profit: sale - cost };
    }, [selectedParts]);

    // Mapping Icon Kategori
    const icons = {
        CPU: <Cpu size={18}/>, Motherboard: <Layout size={18}/>, RAM: <Disc size={18}/>,
        GPU: <Zap size={18}/>, Storage: <HardDrive size={18}/>, PSU: <Zap size={18}/>,
        Cooler: <Wind size={18}/>, Case: <Box size={18}/>, Fan: <Wind size={18}/>,
        Monitor: <Monitor size={18}/>
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 pb-20">
            <div className="max-w-7xl mx-auto">
                <BuilderHeader />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* LIST PEMILIHAN */}
                    <div className="lg:col-span-2 space-y-3">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-5 ml-2">Hardware Selection</h2>
                        {Object.keys(filteredParts).map((cat) => (
                            <div key={cat} className="group relative bg-white/[0.02] border border-white/5 p-5 rounded-[2rem] flex items-center gap-5 hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all duration-500">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors shadow-inner">
                                   {icons[cat]}
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest mb-1">{cat}</p>
                                    <select 
                                        className="w-full bg-transparent text-white font-bold text-sm outline-none cursor-pointer appearance-none"
                                        onChange={(e) => {
                                            const item = filteredParts[cat].find(p => p.id === e.target.value);
                                            setSelectedParts(prev => ({ ...prev, [cat]: item || null }));
                                        }}
                                    >
                                        <option value="" className="bg-slate-900 text-slate-500">Pilih {cat}...</option>
                                        {filteredParts[cat].map(item => (
                                            <option key={item.id} value={item.id} className="bg-slate-900 text-white">
                                                {item.brand} {item.model_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {selectedParts[cat] && (
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-mono text-cyan-500">Rp {Number(selectedParts[cat].price_sale).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* RINGKASAN */}
                    <div className="relative">
                        <BuilderSummary 
                            selectedParts={selectedParts} 
                            totals={totals} 
                            serviceFee={serviceFee} 
                            setServiceFee={setServiceFee} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PCBuilder;