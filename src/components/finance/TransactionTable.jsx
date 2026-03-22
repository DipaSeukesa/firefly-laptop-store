import React from 'react';
import { ArrowRightLeft, ArrowRight, Pencil, Trash2 } from 'lucide-react';

const TransactionTable = ({ 
  transactions, 
  wallets, 
  setShowModal, 
  handleEdit, 
  handleDelete 
}) => {
  return (
    <div className="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="p-5 md:p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <div className="flex flex-col">
          <h3 className="font-bold text-sm md:text-base flex items-center gap-2 text-white">
            <ArrowRightLeft size={18} className="text-indigo-400" />
            Arus Kas
          </h3>
          <p className="hidden md:block text-[10px] text-slate-500 font-medium ml-7 uppercase tracking-widest">Urut Terbaru</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 md:px-6 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
        >
          + CATAT
        </button>
      </div>

      {/* Area Transaksi */}
      <div className="flex flex-col bg-slate-900/50 rounded-3xl border border-white/10 overflow-hidden">
        
        {/* 1. Headings (Desktop Only) */}
        <div className="hidden md:grid grid-cols-12 bg-white/[0.03] text-[10px] text-slate-500 uppercase font-black tracking-widest px-6 py-4 border-b border-white/10">
          <div className="col-span-5">Informasi</div>
          <div className="col-span-3 px-2">Alur Dompet</div>
          <div className="col-span-2 text-right">Nominal</div>
          <div className="col-span-2 text-right pr-4">Aksi</div>
        </div>

        {/* 2. List Body */}
        <div className="divide-y divide-white/5">
          {transactions
            .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal) || b.id - a.id)
            .map(t => {
              const isPemasukan = (t.kategori || "").toLowerCase().includes("pemasukan");
              const isTransfer = t.dari_wallet_id && t.ke_wallet_id;

              return (
                <div key={t.id} className="grid grid-cols-1 md:grid-cols-12 p-4 md:px-6 md:py-5 hover:bg-white/[0.02] transition-all group gap-3 md:gap-0 items-center">
                  
                  {/* Kolom 1: Informasi Utama */}
                  <div className="md:col-span-5 flex flex-col justify-center">
                    <div className="flex justify-between items-start md:block">
                      <span className="font-bold text-slate-100 text-sm md:text-base leading-tight truncate block">
                        {t.keterangan}
                      </span>
                      {/* TOMBOL AKSI MOBILE */}
                      <div className="flex md:hidden gap-3 ml-2 shrink-0">
                        <button onClick={() => handleEdit(t)} className="text-amber-500 p-1 active:scale-90">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="text-rose-500 p-1 active:scale-90">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] md:text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold uppercase tracking-tighter shrink-0">
                        {t.tanggal}
                      </span>
                      <span className="text-[9px] md:text-[10px] text-indigo-400 font-black uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded truncate">
                        {t.kategori}
                      </span>
                    </div>
                  </div>

                  {/* Kolom 2: Alur Dompet */}
                  <div className="md:col-span-3 flex items-center md:px-2">
                    <div className="flex items-center gap-2 bg-white/[0.02] md:bg-transparent p-2 md:p-0 rounded-lg w-full md:w-auto overflow-hidden">
                      <div className={`truncate px-2 py-1 rounded-lg border text-[9px] font-black uppercase ${t.dari_wallet_id ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-slate-800 border-white/5 text-slate-500'}`}>
                        {wallets.find(w => w.id === t.dari_wallet_id)?.name || 'LUAR'}
                      </div>
                      <ArrowRight size={12} className="text-slate-600 shrink-0" />
                      <div className={`truncate px-2 py-1 rounded-lg border text-[9px] font-black uppercase ${t.ke_wallet_id ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-white/5 text-slate-500'}`}>
                        {wallets.find(w => w.id === t.ke_wallet_id)?.name || 'LUAR'}
                      </div>
                    </div>
                  </div>

                  {/* Kolom 3: Nominal */}
                  <div className="md:col-span-2 flex flex-col justify-center md:items-end md:text-right">
                    <span className={`font-black text-base md:text-lg whitespace-nowrap ${isTransfer ? 'text-indigo-400' : isPemasukan ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {isTransfer ? '' : isPemasukan ? '+' : '-'} Rp {Number(t.jumlah).toLocaleString()}
                    </span>
                    {t.fee_transfer > 0 && (
                      <span className="text-[9px] text-rose-400/60 italic font-medium">
                        + Fee Rp {t.fee_transfer.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Kolom 4: Aksi Desktop */}
                  <div className="hidden md:col-span-2 md:flex items-center justify-end gap-2 pr-2">
                    <button
                      onClick={() => handleEdit(t)}
                      className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 opacity-0 group-hover:opacity-100 hover:bg-amber-600 hover:text-white transition-all transform active:scale-90"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-600 hover:text-white transition-all transform active:scale-90"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;