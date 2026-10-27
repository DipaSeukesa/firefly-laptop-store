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
import { getAssetPhoto } from '../components/Asset/AssetCard';

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
    qty: 1, kategori_barang: '',
    foto_url: '',
    spesifikasi: {} // Kolom JSONB fleksibel untuk spek teknis
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => { fetchAssets(); }, []);

  const fetchAssets = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setAssets(data || []);
    } catch (err) { console.error(err.message); }
    finally { if (!silent) setLoading(false); }
  };

  const getAssetAge = (date) => {
    const diffTime = Math.abs(new Date() - new Date(date));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const { parseLocation } = useAssetLocations(assets);

  // MENGUMPULKAN KATEGORI UNIK DARI DATABASE SEBAGAI SUGESTI + KATEGORI DEFAULT
  const uniqueCategories = useMemo(() => {
    const defaultCategories = ['Laptop Second', 'SpearPart', 'Sensor', 'Modul', 'Alat Kerja', 'Suku Cadang', 'Charger & Adaptor'];
    const dbCategories = assets
      .map(a => a.kategori_barang)
      .filter(cat => cat && cat.trim() !== '');
    
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
      
      // Pencarian di dalam spesifikasi JSON (voltase, ukuran jack, compatible, dll)
      const specString = a.spesifikasi ? JSON.stringify(a.spesifikasi).toLowerCase() : '';

      // PENCARIAN CERDAS MULTI-DIMENSI
      const matchSearch = 
        a.nama_barang.toLowerCase().includes(query) || 
        (a.kode_unit && a.kode_unit.toLowerCase().includes(query)) ||
        (a.lokasi_penyimpanan && a.lokasi_penyimpanan.toLowerCase().includes(query)) ||
        (a.kategori_barang && a.kategori_barang.toLowerCase().includes(query)) || 
        (a.catatan_teknis && a.catatan_teknis.toLowerCase().includes(query)) ||
        specString.includes(query);

      const matchLayer = filterLayer === 'all' || a.kategori_layer === parseInt(filterLayer);
      return matchSearch && matchLayer;
    });

    return { totalModal, potentialProfit, needsService, aiAnalysis, filtered };
  }, [assets, searchQuery, filterLayer]);

  // Handler Increment Stok Cepat (+1 / +N)
  const handleIncrementStock = async (id, amount = 1) => {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;
    const newQty = Math.max(0, (Number(asset.qty) || 0) + amount);
    
    // Optimistic Update Lokal
    setAssets(prev => prev.map(a => a.id === id ? { ...a, qty: newQty } : a));
    console.log(`🔄 [Assets] Menambah stok #${asset.kode_unit || asset.nama_barang}: ${asset.qty} -> ${newQty}`);
    
    const { error } = await supabase.from('assets').update({ 
      qty: newQty,
      updated_at: new Date().toISOString()
    }).eq('id', id);

    if (error) {
      console.error("Gagal update stok:", error.message);
      alert(`Gagal menambah stok: ${error.message}`);
      fetchAssets(true);
    }
  };

  // Handler Update Foto Aset (Cloudinary / Web URL / Hapus Foto Otomatis)
  const handleUpdatePhoto = async (id, photoUrl) => {
    const cleanUrl = photoUrl ? photoUrl.trim() : null;

    // 1. Optimistic Update State Lokal: Foto langsung update seketika tanpa reload / flicker!
    setAssets(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, foto_url: cleanUrl };
        if (cleanUrl === null && a.catatan_teknis) {
          updated.catatan_teknis = a.catatan_teknis.replace(/\[FOTO_URL\]:[^\n]+/, '').trim();
        }
        return updated;
      }
      return a;
    }));

    console.log(`🖼️ [Assets] Memperbarui foto aset #${id}:`, cleanUrl || '(Dihapus / Reset ke Badge)');

    try {
      let result = await supabase.from('assets').update({ 
        foto_url: cleanUrl,
        updated_at: new Date().toISOString()
      }).eq('id', id);

      // Fallback jika kolom foto_url belum dibuat di database Supabase (PGRST204)
      if (result.error && (result.error.message?.includes('foto_url') || result.error.code === 'PGRST204')) {
        console.warn('⚠️ [Assets] Fallback foto ke catatan_teknis.');
        const asset = assets.find(a => a.id === id);
        const cleanNotes = (asset?.catatan_teknis || '').replace(/\[FOTO_URL\]:[^\n]+/, '').trim();
        const newNotes = cleanUrl ? (cleanNotes ? `${cleanNotes}\n\n[FOTO_URL]: ${cleanUrl}` : `[FOTO_URL]: ${cleanUrl}`) : cleanNotes;
        result = await supabase.from('assets').update({ catatan_teknis: newNotes }).eq('id', id);
      }

      if (result.error) {
        console.error("Gagal update foto ke Supabase:", result.error.message);
      } else {
        // Silent sync di latar belakang tanpa spinner
        fetchAssets(true);
      }
    } catch (err) {
      console.error("Exception saat update foto:", err);
    }
  };

  const handleSave = async (e, customData = null) => {
    if (e && e.preventDefault) e.preventDefault();
    
    const sourceData = customData || formData;

    // Jika user memilih untuk menambah stok ke unit yang sudah ada (merge)
    if (sourceData._incrementExistingId) {
      await handleIncrementStock(sourceData._incrementExistingId, Number(sourceData.qty) || 1);
      setShowModal(false);
      setEditingId(null);
      setFormData(initialFormState);
      return;
    }

    const finalData = {
      ...sourceData,
      kategori_barang: sourceData.kategori_barang?.trim() === '' ? null : sourceData.kategori_barang?.trim(),
      foto_url: sourceData.foto_url?.trim() || null,
      spesifikasi: sourceData.spesifikasi || {}
    };
    delete finalData._incrementExistingId;

    console.log('%c💾 [Assets] Menyimpan aset ke Supabase...', 'color: #06b6d4; font-weight: bold;', finalData);

    let insertPayload = { ...finalData };
    let result;

    if (editingId) {
      result = await supabase.from('assets').update(insertPayload).eq('id', editingId);
    } else {
      result = await supabase.from('assets').insert([insertPayload]);
    }

    // Fallback cadangan jika ada error skema
    if (result.error && (result.error.message?.includes('spesifikasi') || result.error.message?.includes('foto_url') || result.error.code === 'PGRST204')) {
      console.warn('⚠️ [Assets] Menggunakan fallback catatan_teknis.');
      
      const specEntries = Object.entries(finalData.spesifikasi || {});
      const specList = specEntries.length > 0
        ? specEntries.map(([k, v]) => `• ${k}: ${v}`).join('\n')
        : '';
      
      let combinedNotes = finalData.catatan_teknis || '';
      if (specList) combinedNotes += (combinedNotes ? '\n\n' : '') + `[Spesifikasi AI]:\n${specList}`;
      if (finalData.foto_url) combinedNotes += (combinedNotes ? '\n\n' : '') + `[FOTO_URL]: ${finalData.foto_url}`;

      const fallbackPayload = {
        ...finalData,
        catatan_teknis: combinedNotes
      };
      delete fallbackPayload.spesifikasi;
      delete fallbackPayload.foto_url;

      if (editingId) {
        result = await supabase.from('assets').update(fallbackPayload).eq('id', editingId);
      } else {
        result = await supabase.from('assets').insert([fallbackPayload]);
      }
    }

    if (!result.error) {
      console.log('%c✅ [Assets] Aset berhasil disimpan ke Supabase!', 'color: #10b981; font-weight: bold;');
      setShowModal(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchAssets();
    } else {
      console.error('❌ [Assets] Gagal menyimpan ke Supabase:', result.error.message);
      alert(`Gagal menyimpan ke database: ${result.error.message}`);
    }
  };

  // Handler Simpan Multi-Item Sekaligus dengan Cek Duplikasi / Auto-Increment Stok (Kecuali L1 Laptop Bekas)
  const handleSaveBatch = async (batchItems) => {
    if (!batchItems || batchItems.length === 0) return false;

    console.log(`%c💾 [Assets] Memproses ${batchItems.length} batch items...`, 'color: #06b6d4; font-weight: bold;');

    const toInsert = [];

    for (const item of batchItems) {
      // Cek apakah seri/barang sudah ada di inventaris dan BUKAN Layer 1 (Laptop Bekas)
      let existingMatch = null;
      if (item.kategori_layer !== 1) {
        const cleanName = (item.nama_barang || '').trim().toLowerCase();
        const cleanPartNo = (item.spesifikasi?.part_number || '').trim().toLowerCase();

        existingMatch = assets.find(a => {
          if (a.kategori_layer === 1) return false;
          const aName = (a.nama_barang || '').trim().toLowerCase();
          const aPartNo = (a.spesifikasi?.part_number || '').trim().toLowerCase();

          return (cleanPartNo && aPartNo && cleanPartNo === aPartNo) || (cleanName && aName === cleanName);
        });
      }

      if (existingMatch) {
        // Auto-increment stok untuk aset yang sudah ada
        const addQty = Number(item.qty) || 1;
        const newQty = (Number(existingMatch.qty) || 0) + addQty;
        console.log(`🔄 [Assets] Auto-merge stok "${existingMatch.nama_barang}": ${existingMatch.qty} -> ${newQty}`);
        
        const updatePayload = { 
          qty: newQty, 
          updated_at: new Date().toISOString() 
        };
        // Jika aset lama di database belum memiliki foto dan item batch membawa foto, lengkapi fotonya!
        if (!existingMatch.foto_url && item.foto_url) {
          updatePayload.foto_url = item.foto_url.trim();
        }

        await supabase.from('assets').update(updatePayload).eq('id', existingMatch.id);
      } else {
        toInsert.push(item);
      }
    }

    if (toInsert.length > 0) {
      const payloads = toInsert.map(item => ({
        ...item,
        kategori_barang: item.kategori_barang?.trim() === '' ? null : item.kategori_barang?.trim(),
        foto_url: item.foto_url ? item.foto_url.trim() : null,
        spesifikasi: item.spesifikasi || {}
      }));

      let result = await supabase.from('assets').insert(payloads);

      // Fallback jika kolom spesifikasi / foto_url belum dibuat di Supabase
      if (result.error && (result.error.message?.includes('spesifikasi') || result.error.message?.includes('foto_url') || result.error.code === 'PGRST204')) {
        console.warn('⚠️ [Assets] Fallback batch save ke catatan_teknis...');
        const fallbackPayloads = payloads.map(p => {
          const specEntries = Object.entries(p.spesifikasi || {});
          const specList = specEntries.length > 0
            ? specEntries.map(([k, v]) => `• ${k}: ${v}`).join('\n')
            : '';
          let notes = p.catatan_teknis || '';
          if (specList) notes += (notes ? '\n\n' : '') + `[Spesifikasi AI]:\n${specList}`;
          if (p.foto_url) notes += (notes ? '\n\n' : '') + `[FOTO_URL]: ${p.foto_url}`;

          const copy = { ...p, catatan_teknis: notes };
          delete copy.spesifikasi;
          delete copy.foto_url;
          return copy;
        });
        result = await supabase.from('assets').insert(fallbackPayloads);
      }

      if (result.error) {
        console.error('❌ [Assets] Gagal batch simpan:', result.error.message);
        alert(`Gagal menyimpan batch: ${result.error.message}`);
        return false;
      }
    }

    console.log(`%c✅ [Assets] Selesai memproses batch items!`, 'color: #10b981; font-weight: bold;');
    setShowModal(false);
    setFormData(initialFormState);
    fetchAssets();
    return true;
  };

  const handleEditTrigger = (asset) => {
    setEditingId(asset.id);
    const photo = getAssetPhoto(asset) || '';
    setFormData({
      nama_barang: asset.nama_barang,
      kategori_layer: asset.kategori_layer,
      kondisi: asset.kondisi || 'Bagus',
      harga_modal: asset.harga_modal || 0,
      harga_jual_target: asset.harga_jual_target || 0,
      status_barang: asset.status_barang || 'Tersedia',
      lokasi_penyimpanan: asset.lokasi_penyimpanan || '',
      catatan_teknis: asset.catatan_teknis || '',
      kode_unit: asset.kode_unit || '',
      qty: asset.qty || 1,
      kategori_barang: asset.kategori_barang || '',
      foto_url: photo,
      spesifikasi: asset.spesifikasi || {}
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
    setAssets(prev => prev.map(a => a.id === id ? { ...a, status_barang: newStatus } : a));
    await supabase.from('assets').update({ status_barang: newStatus }).eq('id', id);
    fetchAssets(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 pb-32 font-sans selection:bg-cyan-500 selection:text-black">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors text-xs font-semibold"
          >
            <ChevronLeft size={16} />
            <span>Beranda</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-black text-cyan-400 tracking-tight flex items-center justify-center gap-2">
              <Package size={22} className="text-cyan-400" /> GUDANG ASET
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide mt-0.5">
              Sistem Manajemen Stok & Reality Mapping Lab
            </p>
          </div>

          <button 
            onClick={() => { setEditingId(null); setFormData(initialFormState); setShowModal(true); }}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-950/40"
          >
            <Plus size={16} />
            <span>Tambah Aset</span>
          </button>
          <div className="sm:hidden w-10"></div>
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
          onIncrementStock={handleIncrementStock}
          onUpdatePhoto={handleUpdatePhoto}
        />

        {!loading && <RealityInsight stats={stats} assets={assets} getAssetAge={getAssetAge} />}
      </div>

      {/* FLOATING ACTION BUTTON */}
      <button 
        onClick={() => { setEditingId(null); setFormData(initialFormState); setShowModal(true); }} 
        className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-500/25 z-40 active:scale-95 transition-all duration-200"
        title="Tambah Aset Baru"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {showModal && (
        <AssetModal 
          isOpen={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} 
          formData={formData} setFormData={setFormData} onSave={handleSave} 
          onSaveBatch={handleSaveBatch}
          onIncrementStock={handleIncrementStock}
          existingAssets={assets} categoriesSuggest={uniqueCategories}
        />
      )}
    </div>
  );
};

export default Assets;