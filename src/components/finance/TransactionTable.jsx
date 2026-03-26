import React, { useState } from 'react';
import { 
  ArrowRight, Pencil, Trash2, ChevronDown, 
  Calendar, Clock, TrendingUp, TrendingDown 
} from 'lucide-react';

const TransactionTable = ({ 
  transactions, 
  wallets, 
  setShowModal, 
  handleEdit, 
  handleDelete 
}) => {
  const [showAll, setShowAll] = useState(false);
  const [collapsedDates, setCollapsedDates] = useState({});

  const todayStr = new Date().toISOString().split('T')[0];

  const sortedData = [...transactions].sort((a, b) => {
    const dateA = new Date(a.tanggal);
    const dateB = new Date(b.tanggal);
    if (dateB - dateA !== 0) return dateB - dateA;
    return b.id - a.id;
  });

  const todayTransactions = sortedData.filter(t => t.tanggal === todayStr);
  const olderTransactions = sortedData.filter(t => t.tanggal !== todayStr);
  const dataToProcess = showAll ? sortedData : todayTransactions;

  const groupedTransactions = dataToProcess.reduce((groups, t) => {
    const date = t.tanggal;
    if (!groups[date]) {
      groups[date] = { items: [], netDaily: 0 };
    }
    const amount = Number(t.jumlah || 0);
    const hpp = Number(t.harga_beli || 0);
    const fee = Number(t.fee_transfer || 0);
    const isPemasukan = (t.kategori || "").toLowerCase().includes("pemasukan");
    const isTransfer = t.dari_wallet_id && t.ke_wallet_id;

    if (isTransfer) {
      groups[date].netDaily -= fee;
    } else if (isPemasukan) {
      const profit = t.kategori.toLowerCase().includes('penjualan') ? (amount - hpp) : amount;
      groups[date].netDaily += profit;
    } else {
      groups[date].netDaily -= amount;
    }
    groups[date].items.push(t);
    return groups;
  }, {});

  const getDayName = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long' });
  };

  const formatIDR = (num) => "Rp " + Math.abs(num).toLocaleString('id-ID');

  const toggleDate = (date) => {
    setCollapsedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  return (
    <div className="bg-slate-900 rounded-[1.5rem] border border-white/10 shadow-xl overflow-hidden backdrop-blur-sm">
      
      {/* --- HEADER UTAMA (Lebih Tipis) --- */}
      <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <div className="flex flex-col">
          <h3 className="font-bold text-xs md:text-sm flex items-center gap-2 text-white">
            <Clock size={14} className="text-indigo-400" />
            {showAll ? 'Riwayat' : 'Hari Ini'}
          </h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-500/10"
        >
          + CATAT
        </button>
      </div>

      <div className="flex flex-col bg-slate-900/50">
        {Object.keys(groupedTransactions).length > 0 ? (
          Object.entries(groupedTransactions).map(([date, data]) => {
            const isCollapsed = collapsedDates[date] ?? (date !== todayStr);

            return (
              <div key={date} className="flex flex-col">
                
                {/* STICKY DATE SEPARATOR (Bisa diklik untuk toggle) */}
                <div 
                  onClick={() => toggleDate(date)}
                  className="sticky top-0 z-10 bg-slate-800/90 backdrop-blur-md px-4 md:px-6 py-3 border-y border-white/5 flex justify-between items-center cursor-pointer hover:bg-slate-800 transition-colors group/header"
                >
                  <div className="flex items-center gap-3">
                    <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`} />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-white uppercase tracking-wider leading-none">
                        {date === todayStr ? 'Hari Ini' : getDayName(date)}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-1">
                        {new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black transition-all
                    ${data.netDaily >= 0 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                    {data.netDaily >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span className="opacity-60 text-[8px] uppercase tracking-tighter mr-1 hidden md:inline">Net</span>
                    {data.netDaily < 0 ? '-' : '+'} {formatIDR(data.netDaily)}
                  </div>
                </div>

                {/* TRANSACTION ITEMS (Ukuran & Padding Dikurangi) */}
                {!isCollapsed && (
                  <div className="divide-y divide-white/5 animate-in fade-in duration-300">
                    {data.items.map(t => {
                      const isPemasukan = (t.kategori || "").toLowerCase().includes("pemasukan");
                      const isTransfer = t.dari_wallet_id && t.ke_wallet_id;

                      return (
                        <div key={t.id} className="grid grid-cols-1 md:grid-cols-12 px-4 py-3 md:py-2.5 hover:bg-white/[0.01] transition-all group gap-2 md:gap-0 items-center">
                          
                          {/* Nama Transaksi & Kategori */}
                          <div className="md:col-span-5 flex flex-col min-w-0">
                            <div className="flex justify-between items-center md:block">
                              <span className="font-semibold text-slate-200 text-xs truncate block pr-2">
                                {t.keterangan}
                              </span>
                              <div className="flex md:hidden gap-3 shrink-0">
                                <button onClick={() => handleEdit(t)} className="text-amber-500/70 p-1"><Pencil size={14} /></button>
                                <button onClick={() => handleDelete(t.id)} className="text-rose-500/70 p-1"><Trash2 size={14} /></button>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[8px] text-indigo-400/80 font-bold uppercase tracking-widest bg-indigo-500/5 px-1.5 py-[1px] rounded border border-indigo-500/10">
                                {t.kategori}
                              </span>
                              {t.sub_kategori && (
                                <span className="text-[8px] text-slate-500 font-medium italic truncate">
                                  {t.sub_kategori}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Alur Dompet (Visual Lebih Sederhana) */}
                          <div className="md:col-span-3 flex items-center">
                            <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500">
                              <span className={`px-1.5 py-0.5 rounded border border-white/5 bg-white/5 truncate max-w-[60px] ${t.dari_wallet_id ? 'text-rose-400/80' : ''}`}>
                                {wallets.find(w => w.id === t.dari_wallet_id)?.name || 'OUT'}
                              </span>
                              <ArrowRight size={10} className="opacity-30" />
                              <span className={`px-1.5 py-0.5 rounded border border-white/5 bg-white/5 truncate max-w-[60px] ${t.ke_wallet_id ? 'text-emerald-400/80' : ''}`}>
                                {wallets.find(w => w.id === t.ke_wallet_id)?.name || 'OUT'}
                              </span>
                            </div>
                          </div>

                          {/* Nominal (Font Medium, Fokus Utama) */}
                          <div className="md:col-span-2 flex flex-col justify-center md:items-end md:text-right">
                            <span className={`font-bold text-xs ${isTransfer ? 'text-indigo-300' : isPemasukan ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isTransfer ? '' : isPemasukan ? '+' : '-'} {formatIDR(t.jumlah)}
                            </span>
                            {t.fee_transfer > 0 && (
                              <span className="text-[7px] text-rose-500/60 font-black uppercase tracking-tighter">
                                Fee {formatIDR(t.fee_transfer)}
                              </span>
                            )}
                          </div>

                          {/* Aksi Desktop (Lebih Kecil) */}
                          <div className="hidden md:col-span-2 md:flex items-center justify-end gap-1">
                            <button onClick={() => handleEdit(t)} className="p-1.5 rounded-lg text-slate-500 hover:text-amber-500 transition-all opacity-0 group-hover:opacity-100">
                              <Pencil size={12} />
                            </button>
                            <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center flex flex-col items-center gap-2 opacity-30 italic">
            <Calendar size={24} />
            <span className="text-[10px] uppercase font-bold tracking-widest">Kosong</span>
          </div>
        )}

        {/* --- TOMBOL SHOW MORE (Lebih Tipis) --- */}
        {olderTransactions.length > 0 && (
          <div className="py-4 flex justify-center border-t border-white/5 bg-white/[0.01]">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-all"
            >
              {showAll ? 'Sembunyikan' : `Riwayat Lain (${olderTransactions.length})`}
              <ChevronDown size={12} className={`${showAll ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionTable;