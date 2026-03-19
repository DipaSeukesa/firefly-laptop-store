import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

import {
  ArrowRightLeft, Wallet, Landmark, ChevronDown, Sparkles, ArrowLeft, Plus, X, Trash2, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      // 1. Ambil data mentah
      const { data: walletData } = await supabase.from('wallets').select('*').order('name');
      const { data: financeData } = await supabase.from('finances').select('*').order('tanggal', { ascending: false });

      if (!walletData || !financeData) return;

      // 2. Map data wallet (Saldo otomatis sinkron berkat Robot SQL)
      const updatedWallets = walletData.map(wallet => {
        const masuk = financeData
          .filter(f => f.ke_wallet_id === wallet.id)
          .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);

        const keluar = financeData
          .filter(f => f.dari_wallet_id === wallet.id)
          .reduce((acc, curr) => acc + Number(curr.jumlah || 0) + Number(curr.fee_transfer || 0), 0);

        return {
          ...wallet,
          balance: Number(wallet.balance || 0), // Nilai ini dijaga Robot SQL
          totalIn: masuk,
          totalOut: keluar
        };
      });

      // 3. Kalkulasi Statistik Dashboard
      let pToko = 0, pPribadi = 0, oToko = 0, kToko = 0, kPribadi = 0;

      financeData.forEach(item => {
        const nominal = Number(item.jumlah || 0);
        const hpp = Number(item.harga_beli || 0);
        const fee = Number(item.fee_transfer || 0);

        // Ambil kategori & tipe, ubah ke kecil untuk dicek (biar nggak gampang 0)
        const kat = (item.kategori || "").toLowerCase();
        const tipe = (item.tipe_transaksi || "").toLowerCase();

        if (tipe === 'toko') {
          if (kat.includes('pemasukan')) {
            oToko += nominal;
            pToko += (nominal - hpp);
          } else {
            kToko += (nominal + fee);
          }
        } else {
          // Logika Pribadi
          if (kat.includes('pemasukan')) {
            pPribadi += nominal;
          } else if (kat.includes('pengeluaran')) {
            kPribadi += (nominal + fee);
          }
        }
      });

      // 4. Update State
      setWallets(updatedWallets);
      setTransactions(financeData);
      setProfitToko(pToko);
      setOmsetToko(oToko);
      setKeluarToko(kToko);
      setProfitLain(pPribadi);
      setKeluarPribadi(kPribadi);

      // 5. Total Kekayaan
      const total = updatedWallets.reduce((acc, curr) => acc + curr.balance, 0);
      setTotalKekayaan(total);

    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // --- [3] AUTOMATION LOGIC (Modal New Logic) ---
  useEffect(() => {
    const asetWalletId = wallets.find(w => w.name.toLowerCase().includes('aset'))?.id || '';

    if (formData.tipe_transaksi === 'toko') {
      if (formData.kategori === 'pemasukan penjualan' || formData.kategori === 'pemasukan jasa') {
        setFormData(prev => ({ ...prev, dari_wallet_id: '' }));
      } else if (formData.kategori === 'pembelian aset') {
        setFormData(prev => ({ ...prev, ke_wallet_id: asetWalletId, harga_beli: 0 }));
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

  // --- [4] CALCULATIONS (Untuk Hero Section) ---
  const totalKekayaan = wallets.reduce((acc, curr) => acc + Number(curr.balance), 0);
  const now = new Date();
  const transBulanIni = transactions.filter(t => {
    const d = new Date(t.tanggal);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // Profit Toko (Penjualan - HPP)
  const profitToko = transBulanIni
    .filter(t => t.kategori === 'pemasukan penjualan' || t.kategori === 'pemasukan jasa')
    .reduce((acc, curr) => acc + (Number(curr.jumlah) - Number(curr.harga_beli || 0)), 0);

  // Profit Pribadi (Pemasukan Pribadi)
  const profitLain = transBulanIni
    .filter(t => t.kategori === 'Pemasukan')
    .reduce((acc, curr) => acc + Number(curr.jumlah), 0);

  const totalProfitAll = profitToko + profitLain;

  // Pengeluaran
  const keluarToko = transBulanIni
    .filter(t => t.kategori === 'pengeluaran operasional' || t.kategori === 'pembelian aset')
    .reduce((acc, curr) => acc + Number(curr.jumlah), 0);

  const keluarPribadi = transBulanIni
    .filter(t => t.kategori === 'Pengeluaran')
    .reduce((acc, curr) => acc + Number(curr.jumlah), 0);

  const totalKeluarAll = keluarToko + keluarPribadi;

  const omsetToko = transBulanIni
    .filter(t => t.tipe_transaksi === 'toko' && t.kategori.includes('pemasukan'))
    .reduce((acc, curr) => acc + Number(curr.jumlah), 0);

  // --- [5] SAVE LOGIC ---
  const handleSave = async (e) => {
    e.preventDefault();

    // Bersihkan data untuk dikirim ke Supabase
    const dataToInsert = {
      ...formData,
      // Jika ID kosong, kirim null agar Robot SQL mengenalnya sebagai "Eksternal"
      dari_wallet_id: formData.dari_wallet_id || null,
      ke_wallet_id: formData.ke_wallet_id || null,
      jumlah: Number(formData.jumlah),
      harga_beli: Number(formData.harga_beli || 0),
      fee_transfer: Number(formData.fee_transfer || 0),
      tanggal: formData.tanggal || new Date().toISOString().split('T')[0]
    };

    try {
      // Cukup satu langkah: Simpan transaksi saja!
      const { error } = await supabase
        .from('finances')
        .insert([dataToInsert]);

      if (error) throw error;

      // Robot SQL di Supabase otomatis meng-update saldo di tabel wallets.
      // Kita tinggal refresh data di layar.
      setShowModal(false);
      fetchData();

      // Reset form ke kondisi awal
      setFormData({
        ...formData,
        keterangan: '',
        jumlah: '',
        harga_beli: '',
        fee_transfer: '',
        dari_wallet_id: '',
        ke_wallet_id: ''
      });

    } catch (err) {
      console.error("Gagal simpan:", err.message);
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus transaksi ini? Saldo dompet akan otomatis dikembalikan oleh sistem.")) {
      try {
        const { error } = await supabase
          .from('finances')
          .delete()
          .eq('id', id);
  
        if (error) throw error;
        
        // Refresh data (Robot SQL akan otomatis update saldo di background)
        fetchData();
      } catch (err) {
        alert("Gagal menghapus: " + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin/dashboard')} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-400"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-bold italic tracking-tighter">Finance Hub</h1>
      </div>

      {/* [3.A] HERO SECTION (TOTAL ASSET & PERFORMANCE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-1 bg-indigo-600 rounded-[2.5rem] p-6 shadow-xl shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-center min-h-[160px]">
          <div className="relative z-10">
            <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-1 text-center md:text-left">Total Kekayaan (Uang + Aset)</p>
            <h2 className="text-3xl md:text-4xl font-black text-white text-center md:text-left">Rp {totalKekayaan.toLocaleString()}</h2>
            <div className="mt-4 flex justify-center md:justify-start gap-2">
              <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full text-white font-medium uppercase tracking-tighter">Financial Status</span>
            </div>
          </div>
          <Wallet className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 -rotate-12" />
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div onClick={() => setShowFinanceDetail(!showFinanceDetail)} className={`cursor-pointer transition-all duration-500 rounded-[2rem] p-6 border ${showFinanceDetail ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-slate-900 border-white/10'}`}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Profit (Bulan Ini)</p>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${showFinanceDetail ? 'rotate-180' : ''}`} />
              </div>
              <h3 className="text-2xl font-black text-emerald-400">Rp {totalProfitAll.toLocaleString()}</h3>
              {showFinanceDetail && (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-wide"><span className="text-slate-500">Profit Toko</span><span className="text-emerald-400 font-bold">Rp {profitToko.toLocaleString()}</span></div>
                  <div className="flex justify-between text-[10px] uppercase tracking-wide"><span className="text-slate-500">Pribadi/Lain</span><span className="text-emerald-300 font-bold">Rp {profitLain.toLocaleString()}</span></div>
                </div>
              )}
            </div>

            <div onClick={() => setShowFinanceDetail(!showFinanceDetail)} className={`cursor-pointer transition-all duration-500 rounded-[2rem] p-6 border ${showFinanceDetail ? 'bg-rose-950/30 border-rose-500/50' : 'bg-slate-900 border-white/10'}`}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Pengeluaran</p>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${showFinanceDetail ? 'rotate-180' : ''}`} />
              </div>
              <h3 className="text-2xl font-black text-rose-500">Rp {totalKeluarAll.toLocaleString()}</h3>
              {showFinanceDetail && (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-wide"><span className="text-slate-500">Operasional Toko</span><span className="text-rose-400 font-bold">Rp {keluarToko.toLocaleString()}</span></div>
                  <div className="flex justify-between text-[10px] uppercase tracking-wide"><span className="text-slate-500">Pribadi</span><span className="text-rose-300 font-bold">Rp {keluarPribadi.toLocaleString()}</span></div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Sparkles size={14} /></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Omset Penjualan</span>
            </div>
            <span className="text-lg font-black text-white">Rp {omsetToko.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* [3.B] DETAIL WALLETS */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-400"><Landmark size={16} /> Rincian Saldo Per Akun</h3>
          <button onClick={() => setShowWalletList(!showWalletList)} className="text-[10px] font-bold bg-white/5 text-indigo-400 px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/5">
            {showWalletList ? 'Sembunyikan' : 'Lihat Detail'}
          </button>
        </div>
        {showWalletList && (
          <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-4 no-scrollbar">
            {wallets.map(w => (
              <div key={w.id} className="min-w-[160px] bg-slate-900 border border-white/10 p-5 rounded-[1.5rem] hover:border-indigo-500/50 transition-all">
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{w.name}</p>
                <p className={`text-lg font-black mt-1 ${w.balance < 0 ? 'text-rose-500' : 'text-white'}`}>Rp {Number(w.balance).toLocaleString()}</p>
                <div className="mt-2 text-[8px] text-slate-600 font-mono truncate">{w.account_number || 'Cash Account'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabel Transaksi Adaptif */}
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
  <div className="flex flex-col">
    {/* Headings (Hanya muncul di Desktop) */}
    <div className="hidden md:grid grid-cols-12 bg-white/[0.03] text-[10px] text-slate-500 uppercase font-black tracking-widest p-5">
      <div className="col-span-5">Informasi</div>
      <div className="col-span-3">Alur Dompet</div>
      <div className="col-span-3 text-right">Nominal</div>
      <div className="col-span-1 text-center">Aksi</div>
    </div>

    {/* List Body */}
    <div className="divide-y divide-white/5">
      {transactions
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal) || b.id - a.id)
        .map(t => {
          const isPemasukan = (t.kategori || "").toLowerCase().includes("pemasukan");
          const isTransfer = t.dari_wallet_id && t.ke_wallet_id;
          
          return (
            <div key={t.id} className="grid grid-cols-1 md:grid-cols-12 p-4 md:p-5 hover:bg-white/[0.02] transition-all group gap-3 md:gap-0">
              
              {/* Kolom 1: Informasi Utama */}
              <div className="md:col-span-5 flex flex-col justify-center">
                <div className="flex justify-between md:block">
                  <span className="font-bold text-slate-100 text-sm md:text-base leading-tight">{t.keterangan}</span>
                  {/* Tombol Hapus Mobile (Muncul di kanan keterangan saat di HP) */}
                  <button onClick={() => handleDelete(t.id)} className="md:hidden text-rose-500 p-1"><Trash2 size={16}/></button>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] md:text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">{t.tanggal}</span>
                  <span className="text-[9px] md:text-[10px] text-indigo-400 font-black uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">
                    {t.kategori}
                  </span>
                </div>
              </div>

              {/* Kolom 2: Alur Dompet */}
              <div className="md:col-span-3 flex items-center">
                <div className="flex items-center gap-2 bg-white/[0.02] md:bg-transparent p-2 md:p-0 rounded-lg w-full md:w-auto">
                  <div className={`px-2 py-1 rounded-lg border text-[9px] font-black uppercase ${t.dari_wallet_id ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-slate-800 border-white/5 text-slate-500'}`}>
                    {wallets.find(w => w.id === t.dari_wallet_id)?.name || 'LUAR'}
                  </div>
                  <ArrowRight size={12} className="text-slate-600" />
                  <div className={`px-2 py-1 rounded-lg border text-[9px] font-black uppercase ${t.ke_wallet_id ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-white/5 text-slate-500'}`}>
                    {wallets.find(w => w.id === t.ke_wallet_id)?.name || 'LUAR'}
                  </div>
                </div>
              </div>

              {/* Kolom 3: Nominal */}
              <div className="md:col-span-3 flex flex-col justify-center md:items-end">
                <span className={`font-black text-base md:text-lg ${isTransfer ? 'text-indigo-400' : isPemasukan ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {isTransfer ? '' : isPemasukan ? '+' : '-'} Rp {Number(t.jumlah).toLocaleString()}
                </span>
                {t.fee_transfer > 0 && (
                  <span className="text-[9px] text-rose-400/60 italic font-medium">
                    + Fee Rp {t.fee_transfer.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Kolom 4: Tombol Hapus (Desktop Only) */}
              <div className="hidden md:col-span-1 md:flex items-center justify-center">
                <button 
                  onClick={() => handleDelete(t.id)}
                  className="p-2 rounded-xl bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
    </div>
  </div>
</div>

      {/* --- [4] MODAL INPUT --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[80] flex justify-center items-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">

            {/* Tombol Close Silang */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-black mb-6 uppercase tracking-tighter text-white">Input Transaksi</h2>

            <form onSubmit={handleSave} className="space-y-4">

              {/* Switch Toko / Pribadi */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                <button type="button" onClick={() => setFormData({ ...formData, tipe_transaksi: 'toko', kategori: 'pemasukan penjualan', dari_wallet_id: '', ke_wallet_id: '' })} className={`py-3 rounded-xl font-bold text-[10px] uppercase transition-all ${formData.tipe_transaksi === 'toko' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Toko</button>
                <button type="button" onClick={() => setFormData({ ...formData, tipe_transaksi: 'pribadi', kategori: 'Pemasukan', dari_wallet_id: '', ke_wallet_id: '' })} className={`py-3 rounded-xl font-bold text-[10px] uppercase transition-all ${formData.tipe_transaksi === 'pribadi' ? 'bg-rose-600 text-white' : 'text-slate-500'}`}>Pribadi</button>
              </div>

              {/* Baris Kategori & Tanggal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Kategori</label>
                  <select
                    value={formData.kategori}
                    onChange={e => setFormData({ ...formData, kategori: e.target.value, sub_kategori: '', dari_wallet_id: '', ke_wallet_id: '' })}
                    className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl outline-none mt-1 text-sm text-white"
                  >
                    {formData.tipe_transaksi === 'toko' ? (
                      <>
                        <option value="pemasukan penjualan">Pemasukan Penjualan</option>
                        <option value="pemasukan jasa">Pemasukan Jasa</option>
                        <option value="pembelian aset">Pembelian Aset Toko</option>
                        <option value="pengeluaran operasional">Pengeluaran Operasional</option>
                      </>
                    ) : (
                      <>
                        <option value="Pemasukan">Pemasukan Pribadi</option>
                        <option value="Pengeluaran">Pengeluaran Pribadi</option>
                        <option value="transfer">Transfer Antar Dompet</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Tanggal</label>
                  <input type="date" required value={formData.tanggal} onChange={e => setFormData({ ...formData, tanggal: e.target.value })} className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl text-sm mt-1 text-white outline-none" />
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Keterangan</label>
                <input required placeholder="Detail transaksi..." value={formData.keterangan} onChange={e => setFormData({ ...formData, keterangan: e.target.value })} className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl text-sm mt-1 text-white outline-none" />
              </div>

              {/* Sub Jenis Pribadi */}
              {formData.tipe_transaksi === 'pribadi' && formData.kategori !== 'transfer' && (
                <div className="animate-in fade-in duration-300">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Sub Jenis {formData.kategori}</label>
                  <select required value={formData.sub_kategori} onChange={e => setFormData({ ...formData, sub_kategori: e.target.value })} className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl outline-none mt-1 text-sm text-white">
                    <option value="">-- Pilih Jenis --</option>
                    {formData.kategori === 'Pemasukan' ? (
                      ['Gaji Guru', 'Hibah', 'Lainnya'].map(v => <option key={v} value={v}>{v}</option>)
                    ) : (
                      ['Makanan Pokok', 'Cemilan', 'Tanggungan', 'Kebutuhan Sekunder', 'Tagihan'].map(v => <option key={v} value={v}>{v}</option>)
                    )}
                  </select>
                </div>
              )}

              {/* Alur Dompet (Logika Lock/Unlock) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-rose-400 uppercase ml-2">Dari (Sumber)</label>
                  <select
                    disabled={formData.kategori.includes('pemasukan') || formData.kategori === 'Pemasukan'}
                    required={!(formData.kategori.includes('pemasukan') || formData.kategori === 'Pemasukan')}
                    value={formData.dari_wallet_id}
                    onChange={e => setFormData({ ...formData, dari_wallet_id: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl text-sm mt-1 text-white outline-none disabled:opacity-50 disabled:bg-slate-900"
                  >
                    {formData.kategori.includes('pemasukan') || formData.kategori === 'Pemasukan' ? (
                      <option value="">Dari Eksternal (Otomatis)</option>
                    ) : (
                      <>
                        <option value="">-- Pilih Sumber --</option>
                        {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-400 uppercase ml-2">Ke (Target)</label>
                  <select
                    disabled={formData.kategori.includes('pengeluaran') || formData.kategori === 'Pengeluaran' || formData.kategori === 'pembelian aset' || formData.kategori === 'pengeluaran operasional'}
                    required={!(formData.kategori.includes('pengeluaran') || formData.kategori === 'Pengeluaran' || formData.kategori === 'pembelian aset' || formData.kategori === 'pengeluaran operasional')}
                    value={formData.ke_wallet_id}
                    onChange={e => setFormData({ ...formData, ke_wallet_id: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl text-sm mt-1 text-white outline-none disabled:opacity-50 disabled:bg-slate-900"
                  >
                    {formData.kategori.includes('pengeluaran') || formData.kategori === 'Pengeluaran' || formData.kategori === 'pembelian aset' || formData.kategori === 'pengeluaran operasional' ? (
                      <option value="">Ke Luar (Otomatis)</option>
                    ) : (
                      <>
                        <option value="">-- Pilih Target --</option>
                        {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Nominal Section */}
              <div className="grid grid-cols-2 gap-3">
                <div className={formData.kategori.includes('pemasukan') || formData.kategori === 'transfer' ? '' : 'col-span-2'}>
                  <label className="text-[10px] font-bold text-indigo-400 uppercase ml-2">
                    {formData.kategori === 'transfer' ? 'Nominal Transfer' : formData.kategori.includes('pemasukan') || formData.kategori === 'Pemasukan' ? 'Harga Jual' : 'Harga Beli'}
                  </label>
                  <input type="number" required value={formData.jumlah} onChange={e => setFormData({ ...formData, jumlah: e.target.value })} className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl font-black mt-1 text-white outline-none" />
                </div>
                {(formData.kategori === 'pemasukan penjualan' || formData.kategori === 'pemasukan jasa') && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Modal (HPP)</label>
                    <input type="number" value={formData.harga_beli} onChange={e => setFormData({ ...formData, harga_beli: e.target.value })} className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl mt-1 text-white outline-none" />
                  </div>
                )}
                {formData.kategori === 'transfer' && (
                  <div>
                    <label className="text-[10px] font-bold text-rose-500 uppercase ml-2">Fee Admin</label>
                    <input type="number" value={formData.fee_transfer} onChange={e => setFormData({ ...formData, fee_transfer: e.target.value })} className="w-full bg-slate-800 border border-white/10 p-4 rounded-2xl mt-1 text-white outline-none" />
                  </div>
                )}
              </div>

              <button type="submit" className="w-full bg-indigo-600 p-4 rounded-2xl font-black text-sm mt-4 uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-transform text-white">
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;