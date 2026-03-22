import React from 'react';
import { ArrowLeft, Wallet, ChevronDown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FinanceHero = ({ 
  totalKekayaan, 
  totalProfitAll, 
  profitToko, 
  profitLain, 
  totalKeluarAll, 
  keluarToko, 
  keluarPribadi, 
  omsetToko, 
  showFinanceDetail, 
  setShowFinanceDetail 
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* HERO SECTION (TOTAL ASSET & PERFORMANCE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* TOTAL KEKAYAAN */}
        <div className="md:col-span-1 bg-indigo-600 rounded-[2.5rem] p-6 shadow-xl shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-center min-h-[160px]">
          <div className="relative z-10">
            <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-1 text-center md:text-left">
              Total Kekayaan (Uang + Aset)
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-white text-center md:text-left">
              Rp {totalKekayaan.toLocaleString()}
            </h2>
            <div className="mt-4 flex justify-center md:justify-start gap-2">
              <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full text-white font-medium uppercase tracking-tighter">
                Financial Status
              </span>
            </div>
          </div>
          <Wallet className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 -rotate-12" />
        </div>

        {/* PERFORMANCE STATS */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TOTAL PROFIT CARD */}
            <div 
              onClick={() => setShowFinanceDetail(!showFinanceDetail)} 
              className={`cursor-pointer transition-all duration-500 rounded-[2rem] p-6 border ${
                showFinanceDetail ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-slate-900 border-white/10'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Profit (Bulan Ini)</p>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${showFinanceDetail ? 'rotate-180' : ''}`} />
              </div>
              <h3 className="text-2xl font-black text-emerald-400">Rp {totalProfitAll.toLocaleString()}</h3>
              {showFinanceDetail && (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-wide">
                    <span className="text-slate-500">Profit Toko</span>
                    <span className="text-emerald-400 font-bold">Rp {profitToko.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] uppercase tracking-wide">
                    <span className="text-slate-500">Pribadi/Lain</span>
                    <span className="text-emerald-300 font-bold">Rp {profitLain.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* TOTAL PENGELUARAN CARD */}
            <div 
              onClick={() => setShowFinanceDetail(!showFinanceDetail)} 
              className={`cursor-pointer transition-all duration-500 rounded-[2rem] p-6 border ${
                showFinanceDetail ? 'bg-rose-950/30 border-rose-500/50' : 'bg-slate-900 border-white/10'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Pengeluaran</p>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${showFinanceDetail ? 'rotate-180' : ''}`} />
              </div>
              <h3 className="text-2xl font-black text-rose-500">Rp {totalKeluarAll.toLocaleString()}</h3>
              {showFinanceDetail && (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-wide">
                    <span className="text-slate-500">Operasional Toko</span>
                    <span className="text-rose-400 font-bold">Rp {keluarToko.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] uppercase tracking-wide">
                    <span className="text-slate-500">Pribadi</span>
                    <span className="text-rose-300 font-bold">Rp {keluarPribadi.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* OMSET SECTION */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Sparkles size={14} /></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Omset Penjualan</span>
            </div>
            <span className="text-lg font-black text-white">Rp {omsetToko.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default FinanceHero;