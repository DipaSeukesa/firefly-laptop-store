import React, { useState, useRef } from 'react';
import { Zap, ShoppingCart, Share2, Save, CheckCircle2, AlertCircle, Image as ImageIcon, Cpu } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import html2canvas from 'html2canvas';

const BuilderSummary = ({ selectedParts, totals, serviceFee, setServiceFee }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState(null);
    const buildRef = useRef(null);

    // --- LOGIKA DOWNLOAD GAMBAR (Fix Terpotong) ---
    const handleCaptureImage = async () => {
        if (!buildRef.current) return;
        
        try {
            const canvas = await html2canvas(buildRef.current, {
                backgroundColor: '#0f172a',
                scale: 2,
                logging: false,
                useCORS: true,
                // Fix masalah gambar terpotong saat scroll
                scrollY: -window.scrollY,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight,
            });
            
            const image = canvas.toDataURL("image/png", 1.0);
            const link = document.createElement('a');
            link.href = image;
            link.download = `Penawaran-PC-Firefly-${Date.now()}.png`;
            link.click();
        } catch (err) {
            console.error("Gagal mengambil gambar:", err);
            alert("Gagal membuat gambar. Pastikan browser mendukung capture.");
        }
    };

    // --- LOGIKA SIMPAN (Fix Error 400) ---
    const handleSaveBuild = async () => {
        setIsSaving(true);
        setStatus(null);
        try {
            const { error } = await supabase.from('saved_builds').insert([{
                specs: selectedParts,
                // Memastikan nilai adalah angka (numeric) untuk database
                total_price: Number(totals.sale) + Number(serviceFee),
                total_watt: Number(totals.watt) || 0,
                service_fee: Number(serviceFee) || 0,
                created_at: new Date().toISOString()
            }]);
            
            if (error) throw error;
            
            setStatus('success');
            setTimeout(() => setStatus(null), 3000);
        } catch (err) { 
            console.error("Database Error:", err);
            setStatus('error'); 
            setTimeout(() => setStatus(null), 3000);
        } finally { 
            setIsSaving(false); 
        }
    };

    const grandTotal = totals.sale + Number(serviceFee);

    return (
        <div className="space-y-6 sticky top-8">
            
            {/* 1. INTERNAL VIEW (Hanya konsumsi internal) */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Total Penawaran (Internal)</p>
                        <h2 className="text-3xl font-black italic tracking-tighter text-white">
                            Rp {grandTotal.toLocaleString('id-ID')}
                        </h2>
                    </div>
                    <div className="bg-cyan-500/10 p-2 rounded-xl">
                        <Zap size={20} className="text-cyan-500 animate-pulse" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                        <p className="text-[8px] uppercase font-bold text-slate-500 mb-1 text-center">Profit</p>
                        <p className="text-xs font-mono font-bold text-emerald-400 text-center">
                            +Rp {(totals.profit + Number(serviceFee)).toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                        <p className="text-[8px] uppercase font-bold text-slate-500 mb-1 text-center">Daya Est.</p>
                        <p className="text-xs font-mono font-bold text-yellow-500 text-center">{totals.watt}W</p>
                    </div>
                </div>
            </div>

            {/* 2. AREA CAPTURE GAMBAR (Untuk Client) */}
            <div className="overflow-hidden rounded-[2.5rem]">
                <div ref={buildRef} className="bg-[#0f172a] p-8 border border-white/10">
                    <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Cpu size={18} className="text-cyan-500" />
                                <h1 className="text-lg font-black italic text-white uppercase tracking-tighter">
                                    FIREFLY <span className="text-cyan-500">PC STORE</span>
                                </h1>
                            </div>
                            <p className="text-[8px] text-slate-500 uppercase tracking-[0.3em]">Official Quotation • {new Date().toLocaleDateString('id-ID')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[7px] text-slate-600 uppercase font-bold tracking-widest leading-none">Simulasi Rakitan</p>
                            <p className="text-[10px] text-white font-mono font-bold">#REF-{Math.floor(Math.random() * 9000) + 1000}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                        {Object.entries(selectedParts).map(([key, val]) => (
                            val && (
                                <div key={key} className="flex justify-between items-start gap-6 border-b border-white/5 pb-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[8px] font-black uppercase text-cyan-500/50 mb-1 tracking-tighter">{key}</p>
                                        <p className="text-[11px] text-slate-200 font-bold leading-snug break-words">
                                            {val.brand} {val.model_name}
                                        </p>
                                    </div>
                                    <div className="text-right whitespace-nowrap pt-3">
                                        <p className="text-[11px] text-white font-mono font-bold">
                                            Rp {Number(val.price_sale).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            )
                        ))}
                        
                        <div className="flex justify-between items-center py-2">
                            <span className="text-[8px] font-black uppercase text-slate-500">Jasa Rakit & OS Setup</span>
                            <span className="text-[11px] text-white font-mono font-bold">Rp {Number(serviceFee).toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="bg-cyan-500/5 border border-cyan-500/20 p-5 rounded-3xl flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-cyan-500 tracking-widest">Total Harga Estimasi</span>
                        <span className="text-xl font-black italic text-white tracking-tighter leading-none">
                            Rp {grandTotal.toLocaleString('id-ID')}
                        </span>
                    </div>

                    <p className="text-[7px] text-slate-600 text-center mt-6 uppercase tracking-widest font-bold italic">
                        * Harga dapat berubah mengikuti kurs hardware terbaru
                    </p>
                </div>
            </div>

            {/* 3. INPUT JASA (Hanya UI) */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-2 tracking-widest">Atur Jasa Perakitan</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">Rp</span>
                    <input 
                        type="number" value={serviceFee} onChange={(e) => setServiceFee(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 pl-10 text-white font-bold outline-none focus:border-cyan-500 transition-all"
                    />
                </div>
            </div>

            {/* 4. BUTTONS */}
            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={handleSaveBuild} disabled={isSaving}
                        className={`flex items-center justify-center gap-2 p-4 rounded-2xl transition-all text-[10px] font-black uppercase ${status === 'success' ? 'bg-emerald-500 text-black' : status === 'error' ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-400 border border-white/5'}`}
                    >
                        {status === 'error' ? <AlertCircle size={14}/> : <Save size={14} />} 
                        {status === 'success' ? 'TERSIMPAN' : status === 'error' ? 'GAGAL' : 'SIMPAN'}
                    </button>
                    <button 
                        onClick={handleCaptureImage}
                        className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 p-4 rounded-2xl transition-all text-[10px] font-black text-white shadow-lg shadow-rose-900/20"
                    >
                        <ImageIcon size={14} /> DOWNLOAD PNG
                    </button>
                </div>
                
                <button 
                    onClick={() => {
                        const text = `Halo Admin Firefly, saya ingin menanyakan rakitan PC dengan estimasi total *Rp ${grandTotal.toLocaleString('id-ID')}* (rincian gambar terlampir).`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 p-4 rounded-2xl transition-all text-[11px] font-black text-black shadow-lg shadow-emerald-900/20"
                >
                    <Share2 size={16} /> SHARE TO WHATSAPP
                </button>
            </div>
        </div>
    );
};

export default BuilderSummary; 