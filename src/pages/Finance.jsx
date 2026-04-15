import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Import Komponen
import FinanceHero from '../components/finance/FinanceHero';
import WalletList from '../components/finance/WalletList';
import TransactionTable from '../components/finance/TransactionTable';
import TransactionModal from '../components/finance/TransactionModal';
import TransactionArchive from '../components/finance/TransactionArchive';
import RealityFinance from '../components/finance/RealityFinance';
import { ArrowLeft } from 'lucide-react';

const Finance = () => {
  const navigate = useNavigate();

  // --- [1] STATE ---
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFinanceDetail, setShowFinanceDetail] = useState(false);
  const [showWalletList, setShowWalletList] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' atau 'archive'

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: '',
    jumlah: '',
    harga_beli: 0,
    fee_transfer: 0,
    tipe_transaksi: 'toko',
    kategori: 'pemasukan penjualan',
    sub_kategori: '',
    dari_wallet_id: '',
    ke_wallet_id: ''
  });

  // --- [2] TOUCH SWIPE LOGIC ---
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 60; // Sensitivitas geseran

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && viewMode === 'table') {
      setViewMode('archive');
    }
    if (isRightSwipe && viewMode === 'archive') {
      setViewMode('table');
    }
  };

  // --- [3] FETCH DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: walletData } = await supabase.from('wallets').select('*').order('name');
      const { data: financeData } = await supabase.from('finances').select('*').order('tanggal', { ascending: false });

      if (walletData) setWallets(walletData);
      if (financeData) setTransactions(financeData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- [4] AUTOMATION LOGIC ---
  useEffect(() => {
    const asetWallet = wallets.find(w => w.name.toLowerCase().includes('aset'));
    const asetId = asetWallet ? asetWallet.id : '';

    if (formData.tipe_transaksi === 'toko') {
      if (formData.kategori === 'pemasukan penjualan' || formData.kategori === 'pemasukan jasa') {
        setFormData(prev => ({ ...prev, dari_wallet_id: '' }));
      } else if (formData.kategori === 'pembelian aset') {
        setFormData(prev => ({ ...prev, ke_wallet_id: asetId, harga_beli: 0 }));
      } else if (formData.kategori === 'pengeluaran operasional') {
        setFormData(prev => ({ ...prev, ke_wallet_id: '', harga_beli: 0 }));
      }
    } else {
      if (formData.kategori === 'Pemasukan') {
        setFormData(prev => ({ ...prev, dari_wallet_id: '', harga_beli: 0 }));
      } else if (formData.kategori === 'Pengeluaran') {
        setFormData(prev => ({ ...prev, ke_wallet_id: '', harga_beli: 0 }));
      } else if (formData.kategori === 'transfer') {
        setFormData(prev => ({ ...prev, harga_beli: 0 }));
      }
    }
  }, [formData.kategori, formData.tipe_transaksi, wallets]);

  // --- [5] CALCULATIONS ---
  const stats = useMemo(() => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();

    const monthly = transactions.filter(t => {
      const d = new Date(t.tanggal);
      return d.getMonth() === m && d.getFullYear() === y;
    });

    const tk = wallets.reduce((acc, curr) => acc + Number(curr.balance || 0), 0);
    const ot = monthly.filter(t => t.tipe_transaksi === 'toko' && t.kategori.toLowerCase().includes('pemasukan')).reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);
    const pt = monthly.filter(t => t.kategori === 'pemasukan penjualan' || t.kategori === 'pemasukan jasa').reduce((acc, curr) => acc + (Number(curr.jumlah || 0) - Number(curr.harga_beli || 0)), 0);
    const pl = monthly.filter(t => t.tipe_transaksi === 'pribadi' && t.kategori.toLowerCase().includes('pemasukan')).reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);
    const kt = monthly.filter(t => t.tipe_transaksi === 'toko' && t.kategori.toLowerCase().includes('pengeluaran')).reduce((acc, curr) => acc + Number(curr.jumlah || 0) + Number(curr.fee_transfer || 0), 0);
    const kp = monthly.filter(t => t.tipe_transaksi === 'pribadi' && t.kategori.toLowerCase().includes('pengeluaran')).reduce((acc, curr) => acc + Number(curr.jumlah || 0) + Number(curr.fee_transfer || 0), 0);

    return {
      totalKekayaan: tk, omsetToko: ot, profitToko: pt, profitLain: pl, keluarToko: kt, keluarPribadi: kp, totalProfitAll: pt + pl, totalKeluarAll: kt + kp
    };
  }, [transactions, wallets]);

  // --- [6] ACTIONS ---
  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      keterangan: formData.keterangan,
      tipe_transaksi: formData.tipe_transaksi,
      kategori: formData.kategori,
      sub_kategori: formData.sub_kategori || null,
      dari_wallet_id: formData.dari_wallet_id || null,
      ke_wallet_id: formData.ke_wallet_id || null,
      jumlah: Number(formData.jumlah || 0),
      harga_beli: Number(formData.harga_beli || 0),
      fee_transfer: Number(formData.fee_transfer || 0),
      tanggal: formData.tanggal
    };

    try {
      if (formData.id) {
        const { error } = await supabase.from('finances').update(payload).eq('id', formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('finances').insert([payload]);
        if (error) throw error;
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus? Saldo akan dikembalikan otomatis.")) {
      try {
        const { error } = await supabase.from('finances').delete().eq('id', id);
        if (error) throw error;
        fetchData();
      } catch (err) {
        alert("Gagal menghapus: " + err.message);
      }
    }
  };

  const handleEdit = (t) => {
    setFormData({
      id: t.id, keterangan: t.keterangan, jumlah: t.jumlah, kategori: t.kategori, tipe_transaksi: t.tipe_transaksi,
      sub_kategori: t.sub_kategori || '', dari_wallet_id: t.dari_wallet_id || '', ke_wallet_id: t.ke_wallet_id || '',
      harga_beli: t.harga_beli || 0, fee_transfer: t.fee_transfer || 0, tanggal: t.tanggal
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: null, keterangan: '', jumlah: '', harga_beli: 0, fee_transfer: 0,
      dari_wallet_id: '', ke_wallet_id: '', tipe_transaksi: 'toko', kategori: 'pemasukan penjualan',
      sub_kategori: '', tanggal: new Date().toISOString().split('T')[0]
    });
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pb-24">
      {/* Header App */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-400">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold italic tracking-tighter">Finance Hub</h1>
      </div>

      <FinanceHero
        totalKekayaan={stats.totalKekayaan}
        totalProfitAll={stats.totalProfitAll}
        profitToko={stats.profitToko}
        profitLain={stats.profitLain}
        totalKeluarAll={stats.totalKeluarAll}
        keluarToko={stats.keluarToko}
        keluarPribadi={stats.keluarPribadi}
        omsetToko={stats.omsetToko}
        showFinanceDetail={showFinanceDetail}
        setShowFinanceDetail={setShowFinanceDetail}
      />

      <WalletList
        wallets={wallets}
        showWalletList={showWalletList}
        setShowWalletList={setShowWalletList}
      />

      {/* --- SLIDING NAVIGATION BAR --- */}
      <div className="relative flex p-1 bg-slate-900/50 border border-white/5 rounded-2xl mb-6 overflow-hidden max-w-md mx-auto w-full">
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-lg"
          style={{
            transform: `translateX(${viewMode === 'table' ? '0%' : '100%'})`,
            backgroundColor: viewMode === 'table' ? '#4f46e5' : '#d97706'
          }}
        />
        <button
          onClick={() => setViewMode('table')}
          className={`relative z-10 flex-1 py-2.5 font-black text-[10px] uppercase tracking-widest transition-colors duration-500 ${viewMode === 'table' ? 'text-white' : 'text-slate-500'}`}
        >
          Arus Kas
        </button>
        <button
          onClick={() => setViewMode('archive')}
          className={`relative z-10 flex-1 py-2.5 font-black text-[10px] uppercase tracking-widest transition-colors duration-500 ${viewMode === 'archive' ? 'text-white' : 'text-slate-500'}`}
        >
          Laporan Arsip
        </button>
      </div>

      {/* --- SLIDING CONTENT WINDOW WITH TOUCH HANDLER --- */}
      <div
        className="relative overflow-hidden w-full touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(${viewMode === 'table' ? '0%' : '-100%'})` }}
        >
          {/* HALAMAN 1: ARUS KAS */}
          <div className="w-full shrink-0 px-1">
            <TransactionTable
              transactions={transactions}
              wallets={wallets}
              setShowModal={setShowModal}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          </div>

          {/* HALAMAN 2: ARSIP */}
          <div className="w-full shrink-0 px-1">
            <TransactionArchive
              transactions={transactions}
              wallets={wallets}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          </div>
        </div>
      </div>

      <RealityFinance
        stats={stats}
        transactions={transactions}
        wallets={wallets}
      />

      <TransactionModal
        showModal={showModal}
        setShowModal={(val) => {
          setShowModal(val);
          if (!val) resetForm();
        }}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
        wallets={wallets}
      />
    </div>
  );
};

export default Finance;