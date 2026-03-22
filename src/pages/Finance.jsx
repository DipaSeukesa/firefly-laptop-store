import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Import Komponen Hasil Refactor
import FinanceHero from '../components/finance/FinanceHero';
import WalletList from '../components/finance/WalletList';
import TransactionTable from '../components/finance/TransactionTable';
import TransactionModal from '../components/finance/TransactionModal';
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

  // --- [2] FETCH DATA ---
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

  // --- [3] AUTOMATION LOGIC (Modal Auto-fill) ---
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

  // --- [4] CALCULATIONS (Memoized untuk Performa) ---
  const stats = useMemo(() => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();

    // Filter transaksi bulan ini saja
    const monthly = transactions.filter(t => {
      const d = new Date(t.tanggal);
      return d.getMonth() === m && d.getFullYear() === y;
    });

    const tk = wallets.reduce((acc, curr) => acc + Number(curr.balance || 0), 0);
    
    const ot = monthly
      .filter(t => t.tipe_transaksi === 'toko' && t.kategori.toLowerCase().includes('pemasukan'))
      .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);

    const pt = monthly
      .filter(t => t.kategori === 'pemasukan penjualan' || t.kategori === 'pemasukan jasa')
      .reduce((acc, curr) => acc + (Number(curr.jumlah || 0) - Number(curr.harga_beli || 0)), 0);

    const pl = monthly
      .filter(t => t.tipe_transaksi === 'pribadi' && t.kategori.toLowerCase().includes('pemasukan'))
      .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);

    const kt = monthly
      .filter(t => t.tipe_transaksi === 'toko' && t.kategori.toLowerCase().includes('pengeluaran'))
      .reduce((acc, curr) => acc + Number(curr.jumlah || 0) + Number(curr.fee_transfer || 0), 0);

    const kp = monthly
      .filter(t => t.tipe_transaksi === 'pribadi' && t.kategori.toLowerCase().includes('pengeluaran'))
      .reduce((acc, curr) => acc + Number(curr.jumlah || 0) + Number(curr.fee_transfer || 0), 0);

    return {
      totalKekayaan: tk,
      omsetToko: ot,
      profitToko: pt,
      profitLain: pl,
      keluarToko: kt,
      keluarPribadi: kp,
      totalProfitAll: pt + pl,
      totalKeluarAll: kt + kp
    };
  }, [transactions, wallets]);

  // --- [5] ACTIONS ---
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
      id: t.id,
      keterangan: t.keterangan,
      jumlah: t.jumlah,
      kategori: t.kategori,
      tipe_transaksi: t.tipe_transaksi,
      sub_kategori: t.sub_kategori || '',
      dari_wallet_id: t.dari_wallet_id || '',
      ke_wallet_id: t.ke_wallet_id || '',
      harga_beli: t.harga_beli || 0,
      fee_transfer: t.fee_transfer || 0,
      tanggal: t.tanggal
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      keterangan: '',
      jumlah: '',
      harga_beli: 0,
      fee_transfer: 0,
      dari_wallet_id: '',
      ke_wallet_id: '',
      tipe_transaksi: 'toko',
      kategori: 'pemasukan penjualan',
      sub_kategori: '',
      tanggal: new Date().toISOString().split('T')[0]
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
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-400"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-bold italic tracking-tighter">Finance Hub</h1>
      </div> 
      
      {/* 1. Dashboard Header & Stats */}
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

      {/* 2. Wallets Details */}
      <WalletList
        wallets={wallets}
        showWalletList={showWalletList}
        setShowWalletList={setShowWalletList}
      />

      {/* 3. Transaction History */}
      <TransactionTable
        transactions={transactions}
        wallets={wallets}
        setShowModal={setShowModal}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      {/* 4. Overlay Modal */}
      <TransactionModal
        showModal={showModal}
        setShowModal={(val) => {
          setShowModal(val);
          if (!val) resetForm(); // Reset saat tutup modal
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