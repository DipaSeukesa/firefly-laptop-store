import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, Wallet, Zap, TrendingUp } from 'lucide-react';

const RealityFinance = ({ stats, transactions, wallets }) => {
  const [showRaw, setShowRaw] = useState(false);

  // --- LOGIKA GROUPING DATA ---
  const groupedData = useMemo(() => {
    return transactions.reduce((acc, t) => {
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
      return acc;
    }, {});
  }, [transactions]);

  // --- PEMBENTUKAN JSON UNTUK AI ---
  const financeSummary = useMemo(() => {
    if (!transactions || transactions.length === 0) return "No data available.";
  
    const now = new Date();
    const currentMonthLabel = now.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    
    // 1. Ambil Histori Singkat (Trend 4 Bulan Terakhir)
    const historicalTrend = Object.entries(groupedData)
      .filter(([month]) => month !== currentMonthLabel) // Kecuali bulan ini
      .slice(-4) // Ambil 4 bulan terakhir saja
      .map(([month, data]) => ({
        month,
        net_profit: data.total,
        status: data.total >= 0 ? "SURPLUS" : "DEFICIT"
      }));

    // 2. Data Detail Bulan Aktif
    const currentMonthData = groupedData[currentMonthLabel] || { total: 0, types: {} };
  
    const summary = {
      reality_timestamp: now.toLocaleString('id-ID'),
      active_month: currentMonthLabel,
      
      // Ringkasan Sejarah (Agar AI tahu perkembangan)
      historical_performance: historicalTrend,

      financial_status: {
        net_balance_this_month: currentMonthData.total,
        total_wealth_liquid: stats.totalKekayaan
      },

      expense_analysis: {
        toko: currentMonthData.types['Toko']?.cats || {},
        pribadi: currentMonthData.types['Pribadi']?.cats['Pengeluaran']?.subs || {}
      },

      wallet_health: wallets.map(w => ({
        name: w.name,
        balance: w.balance
      })),

      alerts: {
        high_spending: Object.entries(currentMonthData.types['Pribadi']?.cats['Pengeluaran']?.subs || {})
          .filter(([_, val]) => Math.abs(val.total) > 500000)
          .map(([name]) => name)
      },

      ai_context_guideline: `Bandingkan net_balance ${currentMonthLabel} dengan historical_performance. Analisis apakah defisit bulan ini adalah pola rutin atau anomali. Sesuaikan strategi target Rp192rb/hari berdasarkan trend ini.`,
      ai_instruction_override: "Jika net_balance bulan ini lebih buruk dari rata-rata historical, berikan peringatan keras dan bedah pengeluaran pribadi non-pokok."
    };
  
    return JSON.stringify(summary, null, 2);
  }, [transactions, stats, wallets, groupedData]);

  const handleCopyAI = () => {
    navigator.clipboard.writeText(financeSummary);
    alert("Financial Reality Injected with History!");
  };

  return (
    <div className="mt-6 bg-slate-900/50 border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all"
        onClick={() => setShowRaw(!showRaw)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-500 rounded-lg">
            <Wallet size={18} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Financial Reality</h4>
            <div className="flex items-center gap-1">
              <TrendingUp size={10} className="text-emerald-500" />
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">AI Finance Feed + History</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600 font-mono italic">
                {showRaw ? 'STREAMS_ACTIVE' : 'READY_TO_INJECT'}
            </span>
            <button className="text-slate-500">
                {showRaw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
      </div>

      {showRaw && (
        <div className="p-4 bg-black/60 border-t border-white/5">
          <pre className="text-[10px] font-mono text-amber-400/90 leading-relaxed overflow-x-auto no-scrollbar py-2 max-h-[350px]">
            {financeSummary}
          </pre>
          <div className="mt-4 pt-3 border-t border-white/5">
            <button 
              onClick={handleCopyAI}
              className="w-full bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 py-3 rounded-xl flex items-center justify-center gap-2 group transition-all"
            >
              <Zap size={12} className="text-amber-400 group-hover:animate-pulse" />
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Inject Financial Context</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealityFinance;