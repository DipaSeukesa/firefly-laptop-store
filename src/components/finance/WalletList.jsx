import React from 'react';
import { Landmark } from 'lucide-react';

const WalletList = ({ 
  wallets, 
  showWalletList, 
  setShowWalletList 
}) => {
  return (
    <div className="mb-8">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-400">
          <Landmark size={16} /> Rincian Saldo Per Akun
        </h3>
        <button 
          onClick={() => setShowWalletList(!showWalletList)} 
          className="text-[10px] font-bold bg-white/5 text-indigo-400 px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-colors"
        >
          {showWalletList ? 'Sembunyikan' : 'Lihat Detail'}
        </button>
      </div>

      {/* HORIZONTAL / GRID LIST */}
      {showWalletList && (
        <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-4 no-scrollbar">
          {wallets.map((w) => (
            <div 
              key={w.id} 
              className="min-w-[160px] bg-slate-900 border border-white/10 p-5 rounded-[1.5rem] hover:border-indigo-500/50 transition-all group"
            >
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest group-hover:text-indigo-400 transition-colors">
                {w.name}
              </p>
              <p className={`text-lg font-black mt-1 ${Number(w.balance) < 0 ? 'text-rose-500' : 'text-white'}`}>
                Rp {Number(w.balance).toLocaleString()}
              </p>
              <div className="mt-2 text-[8px] text-slate-600 font-mono truncate">
                {w.account_number || 'Cash Account'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WalletList;