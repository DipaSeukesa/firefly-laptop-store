import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, Package } from 'lucide-react';

// Import Komponen Pecahan
import RealityInsight from '../components/Asset/RealityInsight';
import AssetStats from '../components/Asset/AssetStats';
import AssetModal from '../components/Asset/AssetModal';
import RealityMap from '../components/Asset/RealityMap'; 
import AssetFiltersAndList from '../components/Asset/AssetFiltersAndList';

// Import Custom Hook
import { useAssetLocations } from '../hooks/Asset/useAssetLocations';

const Assets = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLayer, setFilterLayer] = useState('all');
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    nama_barang: '', kategori_layer: 1, kondisi: 'Bagus',
    harga_modal: 0, harga_jual_target: 0, status_barang: 'Tersedia',
    lokasi_penyimpanan: '', catatan_teknis: '', kode_unit: '',
    qty: 1, kategori_barang: '' // Null/Kosong di awal sesuai arsitektur database baru
  };

  const [formData, setFormData] = useState(initialFormState);

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

  const { parseLocation } = useAssetLocations(assets);

  // MENGUMPULKAN KATEGORI UNIK DARI DATABASE SEBAGAI SUGESTI + KATEGORI DEFAULT
  const uniqueCategories = useMemo(() => {
    const defaultCategories = ['Laptop Second', 'SpearPart', 'Sensor', 'Modul', 'Alat Kerja', 'Suku Cadang'];
    const dbCategories = assets
      .map(a => a.kategori_barang)
      .filter(cat => cat && cat.trim() !== ''); // Bersihkan nilai null / string kosong
    
    // Gabungkan dan buang duplikasi menggunakan Set
    return Array.from(new Set([...defaultCategories, ...dbCategories]));
  }, [assets]);

  const stats = useMemo(() => {
    const totalModal = assets.reduce((acc, curr) => acc + ((Number(curr.harga_modal) || 0) * (curr.qty || 1)), 0);
    const assetsL1 = assets.filter(a => a.kategori_layer === 1);
    
    const potentialProfit = assetsL1.reduce((acc, curr) => {
      const margin = (Number(curr.harga_jual_target) || 0) - (Number(curr.harga_modal) || 0);
      return acc + (margin > 0 ? (margin * (curr.qty || 1)) : 0);
    }, 0);

    const needsService = assets.filter(a => a.status_barang === 'Servis').length;
    const stokLama = assets.filter(a => getAssetAge(a.created_at) > 30 && a.status_barang === 'Tersedia');
    const modalMacet = stokLama.reduce((acc, curr) => acc + (Number(curr.harga_modal) * (curr.qty || 1)), 0);
    
    const isCritical = stokLama.length > 2 || needsService > 1;
    const aiAnalysis = {
      status: isCritical ? 'KRITIS' : 'OPTIMAL',
      healthScore: Math.max(0, 100 - (stokLama.length * 10) - (needsService * 15)),
      ratio: assets.filter(a => a.kategori_layer === 1).length > assets.filter(a => a.kategori_layer === 2).length ? 'Agresif (Profit-Oriented)' : 'Defensif (Heavy-Asset)',
      message: needsService > 0 ? `Ada ${needsService} jenis alat (L2) rusak. Operasional terhambat!` : stokLama.length > 0 ? `Rp ${modalMacet.toLocaleString()} modal terhenti di stok lama (>30 hari).` : "Alur aset sangat sehat. Pertahankan!"
    };

    const filtered = assets.filter(a => {
      const query = searchQuery.toLowerCase();
      
      // PENCARIAN CERDAS MULTI-DIMENSI (Nama, Kode, Lokasi, Kategori, & Deskripsi Catatan)
      const matchSearch = 
        a.nama_barang.toLowerCase().includes(query) || 
        (a.kode_unit && a.kode_unit.toLowerCase().includes(query)) ||
        (a.lokasi_penyimpanan && a.lokasi_penyimpanan.toLowerCase().includes(query)) ||
        (a.kategori_barang && a.kategori_barang.toLowerCase().includes(query)) || 
        (a.catatan_teknis && a.catatan_teknis.toLowerCase().includes(query));

      const matchLayer = filterLayer === 'all' || a.kategori_layer === parseInt(filterLayer);
      return matchSearch && matchLayer;
    });

    return { totalModal, potentialProfit, needsService, aiAnalysis, filtered };
  }, [assets, searchQuery, filterLayer]);

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validasi opsional: ubah string kosong menjadi null saat disimpan ke database
    const finalData = {
      ...formData,
      kategori_barang: formData.kategori_barang?.trim() === '' ? null : formData.kategori_barang.trim()
    };

    if (editingId) {
      const { error } = await supabase.from('assets').update(finalData).eq('id', editingId);
      if (!error) {
        setShowModal(false);
        setEditingId(null);
        setFormData(initialFormState);
        fetchAssets();
      } else { console.error("Gagal memperbarui:", error.message); }
    } else {
      const { error } = await supabase.from('assets').insert([finalData]);
      if (!error) {
        setShowModal(false);
        setFormData(initialFormState);
        fetchAssets();
      } else { console.error("Gagal menambahkan:", error.message); }
    }
  };

  const handleEditTrigger = (asset) => {
    setEditingId(asset.id);
    setFormData({
      nama_barang: asset.nama_barang,
      kategori_layer: asset.kategori_layer,
      kondisi: asset.kondisi,
      harga_modal: asset.harga_modal,
      harga_jual_target: asset.harga_jual_target,
      status_barang: asset.status_barang,
      lokasi_penyimpanan: asset.lokasi_penyimpanan,
      catatan_teknis: asset.catatan_teknis || '',
      kode_unit: asset.kode_unit || '',
      qty: asset.qty || 1,
      kategori_barang: asset.kategori_barang || ''
    });
    setShowModal(true);
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

      {!loading && <RealityMap assets={assets} onSelectLocation={(id) => setSearchQuery(id)} />}

      <AssetFiltersAndList
        filterLayer={filterLayer} setFilterLayer={setFilterLayer}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        loading={loading} filteredAssets={stats.filtered}
        parseLocation={parseLocation} getAssetAge={getAssetAge}
        deleteAsset={deleteAsset} updateStatus={updateStatus}
        onEditClick={handleEditTrigger}
      />

      {!loading && <RealityInsight stats={stats} assets={assets} getAssetAge={getAssetAge} />}

      <button 
        onClick={() => { setEditingId(null); setFormData(initialFormState); setShowModal(true); }} 
        className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-600 rounded-full flex items-center justify-center shadow-lg z-40 active:scale-90 transition-transform shadow-cyan-900/40"
      >
        <Plus size={28} />
      </button>

      {showModal && (
        <AssetModal 
          isOpen={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} 
          formData={formData} setFormData={setFormData} onSave={handleSave} 
          existingAssets={assets} categoriesSuggest={uniqueCategories} // Oper daftar sugesti unik ke modal
        />
      )}
    </div>
  );
};

export default Assets;