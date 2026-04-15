import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, Package, Search } from 'lucide-react';

// Import Komponen Pecahan
import RealityInsight from '../components/Asset/RealityInsight';
import AssetCard from '../components/Asset/AssetCard';
import AssetStats from '../components/Asset/AssetStats';
import AssetModal from '../components/Asset/AssetModal';

const Assets = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLayer, setFilterLayer] = useState('all');

  const [formData, setFormData] = useState({
    nama_barang: '', kategori_layer: 1, kondisi: 'Bagus',
    harga_modal: 0, harga_jual_target: 0, status_barang: 'Tersedia',
    lokasi_penyimpanan: '', catatan_teknis: '', kode_unit: ''
  });

  useEffect(() => { fetchAssets(); }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setAssets(data || []);
    } catch (err) { console.error(err.message); }
    finally { setLoading(false); }
  };

  const getAssetAge = (date) => {
    const diffTime = Math.abs(new Date() - new Date(date));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const stats = useMemo(() => {
    const totalModal = assets.reduce((acc, curr) => acc + (Number(curr.harga_modal) || 0), 0);
    const assetsL1 = assets.filter(a => a.kategori_layer === 1);
    const potentialProfit = assetsL1.reduce((acc, curr) => {
      const margin = (Number(curr.harga_jual_target) || 0) - (Number(curr.harga_modal) || 0);
      return acc + (margin > 0 ? margin : 0);
    }, 0);
    const needsService = assets.filter(a => a.status_barang === 'Servis').length;
    const stokLama = assets.filter(a => getAssetAge(a.created_at) > 30 && a.status_barang === 'Tersedia');
    const modalMacet = stokLama.reduce((acc, curr) => acc + Number(curr.harga_modal), 0);
    
    const isCritical = stokLama.length > 2 || needsService > 1;
    const aiAnalysis = {
      status: isCritical ? 'KRITIS' : 'OPTIMAL',
      healthScore: Math.max(0, 100 - (stokLama.length * 10) - (needsService * 15)),
      ratio: assets.filter(a => a.kategori_layer === 1).length > assets.filter(a => a.kategori_layer === 2).length ? 'Agresif (Profit-Oriented)' : 'Defensif (Heavy-Asset)',
      message: needsService > 0 ? `Ada ${needsService} alat (L2) rusak. Operasional terhambat!` : stokLama.length > 0 ? `Rp ${modalMacet.toLocaleString()} modal terhenti di stok lama (>30 hari).` : "Alur aset sangat sehat. Pertahankan!"
    };

    const filtered = assets.filter(a => {
      const matchSearch = a.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) || (a.kode_unit && a.kode_unit.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchLayer = filterLayer === 'all' || a.kategori_layer === parseInt(filterLayer);
      return matchSearch && matchLayer;
    });

    return { totalModal, potentialProfit, needsService, aiAnalysis, filtered };
  }, [assets, searchQuery, filterLayer]);

  const handleSave = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('assets').insert([formData]);
    if (!error) {
      setShowModal(false);
      setFormData({ nama_barang: '', kategori_layer: 1, kondisi: 'Bagus', harga_modal: 0, harga_jual_target: 0, status_barang: 'Tersedia', lokasi_penyimpanan: '', catatan_teknis: '', kode_unit: '' });
      fetchAssets();
    }
  };

  const deleteAsset = async (id) => {
    if (window.confirm("Hapus aset secara permanen?")) {
      await supabase.from('assets').delete().eq('id', id);
      fetchAssets();
    }
  };

  const updateStatus = async (id, newStatus) => {
    await supabase.from('assets').update({ status_barang: newStatus }).eq('id', id);
    fetchAssets();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/')} className="p-2 bg-white/5 rounded-full text-slate-400"><ChevronLeft size={20} /></button>
        <div className="text-center">
          <h1 className="text-lg font-black italic text-cyan-500 uppercase tracking-tighter flex items-center gap-2"><Package size={18} /> GUDANG ASET</h1>
          <p className="text-[8px] text-slate-500 uppercase tracking-widest">Reality Mapping System</p>
        </div>
        <div className="w-10"></div>
      </div>

      <AssetStats stats={stats} />

      {/* FILTERS */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {['all', '1', '2', '3'].map((l) => (
          <button key={l} onClick={() => setFilterLayer(l)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${filterLayer === l ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-white/5 border-transparent text-slate-500'}`}
          >
            {l === 'all' ? 'Semua' : `Layer ${l}`}
          </button>
        ))}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
        <input type="text" placeholder="Cari barang atau kode unit..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-slate-600 animate-pulse text-xs">Menghubungkan ke database...</p>
        ) : (
          stats.filtered.map((asset) => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              age={getAssetAge(asset.created_at)} 
              onDelete={deleteAsset} 
              onUpdateStatus={updateStatus} 
            />
          ))
        )}
      </div>

      {!loading && <RealityInsight stats={stats} assets={assets} getAssetAge={getAssetAge} />}

      <button onClick={() => setShowModal(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-600 rounded-full flex items-center justify-center shadow-lg z-40 active:scale-90 transition-transform shadow-cyan-900/40"><Plus size={28} /></button>

      <AssetModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        formData={formData} 
        setFormData={setFormData} 
        onSave={handleSave} 
      />
    </div>
  );
};

export default Assets;