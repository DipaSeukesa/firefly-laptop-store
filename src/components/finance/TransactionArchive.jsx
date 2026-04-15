import React, { useState, useRef } from 'react';
import { 
  ChevronDown, ChevronRight, Folder, ShoppingBag, 
  Wrench, Box, Wallet, User, ArrowRightLeft, 
  TrendingUp, Pencil, Trash2, CreditCard, MinusCircle 
} from 'lucide-react';

const TransactionArchive = ({ transactions, wallets, handleEdit, handleDelete }) => {
  const [expanded, setExpanded] = useState({});

  const toggle = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const formatIDR = (num) => "Rp " + Math.abs(num).toLocaleString('id-ID');

  // --- LOGIKA GROUPING DATA (Tetap) ---
  const groupedData = transactions.reduce((acc, t) => {
    const date = new Date(t.tanggal);
    const monthYear = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    const tipe = t.tipe_transaksi === 'toko' ? 'Toko' : 'Pribadi';
    const kategori = t.kategori;
    const sub = t.sub_kategori || 'Umum';

    if (!acc[monthYear]) acc[monthYear] = { total: 0, types: {} };
    if (!acc[monthYear].types[tipe]) acc[monthYear].types[tipe] = { total: 0, cats: {} };
    if (!acc[monthYear].types[tipe].cats[kategori]) acc[monthYear].types[tipe].cats[kategori] = { total: 0, totalFee: 0, subs: {} };
    if (!acc[monthYear].types[tipe].cats[kategori].subs[sub]) acc[monthYear].types[tipe].cats[kategori].subs[sub] = { total: 0, items: [] };

    const amount = Number(t.jumlah || 0);
    const hpp = Number(t.harga_beli || 0);
    const fee = Number(t.fee_transfer || 0);
    
    if (tipe === 'Toko') {
      if (kategori === 'pemasukan penjualan') {
        const profit = amount - hpp;
        acc[monthYear].total += profit;
        acc[monthYear].types[tipe].total += profit;
        acc[monthYear].types[tipe].cats[kategori].total += profit;
      } else if (kategori === 'pemasukan jasa') {
        acc[monthYear].total += amount;
        acc[monthYear].types[tipe].total += amount;
        acc[monthYear].types[tipe].cats[kategori].total += amount;
      } else if (kategori === 'pengeluaran operasional') {
        acc[monthYear].total -= amount;
        acc[monthYear].types[tipe].total -= amount;
        acc[monthYear].types[tipe].cats[kategori].total -= amount;
      } else if (kategori === 'pembelian aset') {
        acc[monthYear].types[tipe].cats[kategori].total += amount;
      }
    } else {
      if (kategori === 'Pemasukan') {
        acc[monthYear].total += amount;
        acc[monthYear].types[tipe].total += amount;
        acc[monthYear].types[tipe].cats[kategori].total += amount;
      } else if (kategori === 'Pengeluaran') {
        acc[monthYear].total -= (amount + fee);
        acc[monthYear].types[tipe].total -= (amount + fee);
        acc[monthYear].types[tipe].cats[kategori].total -= amount;
        acc[monthYear].types[tipe].cats[kategori].subs[sub].total -= amount;
      } else if (kategori === 'transfer') {
        acc[monthYear].total -= fee;
        acc[monthYear].types[tipe].total -= fee;
        acc[monthYear].types[tipe].cats[kategori].total += amount; 
        acc[monthYear].types[tipe].cats[kategori].totalFee -= fee;
      }
    }
    acc[monthYear].types[tipe].cats[kategori].subs[sub].items.push(t);
    return acc;
  }, {});

  const getIcon = (label) => {
    const l = label.toLowerCase();
    if (l.includes('202')) return <TrendingUp size={14} className="text-indigo-400" />;
    if (l === 'toko') return <ShoppingBag size={14} className="text-amber-400" />;
    if (l === 'pribadi') return <User size={14} className="text-sky-400" />;
    if (l.includes('penjualan')) return <Box size={14} className="text-emerald-400" />;
    if (l.includes('jasa')) return <Wrench size={14} className="text-emerald-400" />;
    if (l.includes('aset')) return <CreditCard size={14} className="text-indigo-400" />;
    if (l.includes('operasional')) return <MinusCircle size={14} className="text-rose-400" />;
    if (l === 'transfer') return <ArrowRightLeft size={14} className="text-indigo-400" />;
    if (l === 'pemasukan') return <Wallet size={14} className="text-emerald-400" />;
    if (l === 'pengeluaran') return <MinusCircle size={14} className="text-rose-400" />;
    return <Folder size={14} className="text-slate-500" />;
  };

  const Row = ({ level, label, amount, feeLabel, onClick, isOpen, children }) => {
    const l = label.toLowerCase();
    let colorClass = amount < 0 ? "text-rose-500" : amount > 0 ? "text-emerald-400" : "text-slate-500";
    if (l.includes('aset') || l === 'transfer') colorClass = "text-indigo-400";

    return (
      <div className="select-none">
        <div 
          onClick={onClick}
          className={`flex items-center justify-between p-3 border-b border-white/5 active:bg-white/[0.03] cursor-pointer transition-all ${level === 0 ? 'bg-white/[0.03]' : ''}`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {isOpen ? <ChevronDown size={12} className="text-slate-600" /> : <ChevronRight size={12} className="text-slate-600" />}
            {getIcon(label)}
            <span className={`text-[11px] font-bold truncate ${level === 0 ? 'text-indigo-400 uppercase tracking-widest' : 'text-slate-300'}`}>
              {label}
            </span>
          </div>
          <div className="text-right shrink-0 ml-4 flex flex-col">
            <span className={`text-[10px] font-black ${colorClass}`}>
               {(colorClass.includes('indigo') || amount === 0) ? '' : (amount < 0 ? '-' : '+')} {formatIDR(amount)}
            </span>
            {feeLabel && <span className="text-[8px] text-rose-500 font-black uppercase tracking-tighter">Fee {formatIDR(feeLabel)}</span>}
          </div>
        </div>
        {isOpen && children}
      </div>
    );
  };

  return (
    <div className="mt-8 bg-slate-900/50 rounded-[2rem] border border-white/10 overflow-hidden mb-20">
      <div className="divide-y divide-white/5">
        {Object.entries(groupedData).map(([mYear, mData]) => (
          <Row key={mYear} level={0} label={mYear} amount={mData.total} isOpen={expanded[mYear]} onClick={() => toggle(mYear)}>
            {Object.entries(mData.types).map(([type, tData]) => (
              <Row key={type} level={1} label={type} amount={tData.total} isOpen={expanded[mYear+type]} onClick={() => toggle(mYear+type)}>
                {Object.entries(tData.cats).map(([cat, cData]) => {
                  const hasSub = cat === 'Pengeluaran';
                  return (
                    <Row key={cat} level={2} label={cat} amount={cData.total} feeLabel={cat === 'transfer' ? cData.totalFee : null} isOpen={expanded[mYear+type+cat]} onClick={() => toggle(mYear+type+cat)}>
                      {Object.entries(cData.subs).map(([sub, sData]) => (
                        <React.Fragment key={sub}>
                          {hasSub ? (
                            <Row level={3} label={sub} amount={sData.total} isOpen={expanded[mYear+type+cat+sub]} onClick={() => toggle(mYear+type+cat+sub)}>
                              {sData.items.map(t => <ItemRow key={t.id} t={t} formatIDR={formatIDR} onEdit={handleEdit} onDelete={handleDelete} />)}
                            </Row>
                          ) : (
                            expanded[mYear+type+cat] && sData.items.map(t => <ItemRow key={t.id} t={t} formatIDR={formatIDR} onEdit={handleEdit} onDelete={handleDelete} />)
                          )}
                        </React.Fragment>
                      ))}
                    </Row>
                  );
                })}
              </Row>
            ))}
          </Row>
        ))}
      </div>
    </div>
  );
};

// --- KOMPONEN ITEM ROW DENGAN FITUR KLIK TAHAN ---
const ItemRow = ({ t, formatIDR, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const timerRef = useRef(null);

  // Fungsi deteksi klik tahan (Long Press)
  const startPress = () => {
    timerRef.current = setTimeout(() => {
      setShowActions(true);
      if (window.navigator.vibrate) window.navigator.vibrate(50); // Getar dikit biar premium
    }, 600); // 0.6 detik tahan
  };

  const endPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div 
      onMouseDown={startPress}
      onMouseUp={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onMouseLeave={endPress}
      className={`relative flex justify-between items-center py-3 pr-4 pl-12 transition-all duration-300 border-b border-white/5 group ${showActions ? 'bg-indigo-500/10' : 'bg-black/40 hover:bg-white/[0.02]'}`}
    >
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] text-slate-200 font-bold truncate">{t.keterangan}</span>
        <span className="text-[8px] text-slate-500 font-black uppercase">{t.tanggal}</span>
      </div>

      <div className="flex items-center gap-4 shrink-0 h-8">
        {!showActions ? (
          <div className="text-right animate-in fade-in slide-in-from-right-2 duration-300">
            <span className="text-[10px] font-black text-slate-400">{formatIDR(t.jumlah)}</span>
            {t.fee_transfer > 0 && <p className="text-[8px] text-rose-500 font-bold">FEE {formatIDR(t.fee_transfer)}</p>}
          </div>
        ) : (
          <div className="flex gap-2 animate-in zoom-in duration-300">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(t); setShowActions(false); }}
              className="p-2 bg-amber-500 text-white rounded-lg shadow-lg active:scale-95 transition-transform"
            >
              <Pencil size={12} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(t.id); setShowActions(false); }}
              className="p-2 bg-rose-500 text-white rounded-lg shadow-lg active:scale-95 transition-transform"
            >
              <Trash2 size={12} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowActions(false); }}
              className="p-2 bg-slate-700 text-white rounded-lg active:scale-95 transition-transform text-[8px] font-bold"
            >
              X
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionArchive;