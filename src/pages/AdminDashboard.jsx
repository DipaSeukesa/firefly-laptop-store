import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Plus, Edit, Trash2, Home, Settings, Laptop, X,
  Save, Image as ImageIcon, Store, Sparkles, Menu
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // ============================================================
  // [1] STATE MANAGEMENT
  // Tempat penyimpanan data sementara (Lokal)
  // ============================================================
  const [laptops, setLaptops] = useState([]);
  const [settings, setSettings] = useState({
    whatsapp: '', logo: '', shop_name: '', shop_tagline: ''
  });
  const [loading, setLoading] = useState(true);
  const [showLaptopModal, setShowLaptopModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false); // State untuk Modal Pengaturan
  const [editingLaptop, setEditingLaptop] = useState(null);
  const [saving, setSaving] = useState(false);

  // Data Form untuk input Laptop
  const [formData, setFormData] = useState({
    nama: '', harga: '', deskripsi: '', link_gambar: '', kategori: '',
    processor: '', ram: '', storage: '', display: '',
    battery_health: '', condition_physical: '', features: '',
    hook_description: '',
    img1: '', img2: '', img3: '', img4: '', img5: ''
  });

  // ============================================================
  // [2] DATA FETCHING (SUPABASE)
  // Mengambil data dari database saat halaman pertama kali dimuat
  // ============================================================
  useEffect(() => {
    fetchLaptops();
    fetchSettings();
  }, []);

  const fetchLaptops = async () => {
    try {
      const { data, error } = await supabase.from('laptops').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setLaptops(data || []);
    } catch (error) { console.error('Gagal ambil data laptop:', error); } finally { setLoading(false); }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*').single();
      if (data) setSettings(data);
    } catch (error) { console.error('Gagal ambil data toko:', error); }
  };

  // ============================================================
  // [3] LOGIC HANDLERS (MODAL & SAVE)
  // Fungsi untuk membuka jendela pop-up dan menyimpan data
  // ============================================================
  const openAddModal = () => {
    setEditingLaptop(null);
    setFormData({
      nama: '', harga: '', deskripsi: '', link_gambar: '', kategori: '',
      processor: '', ram: '', storage: '', display: '',
      battery_health: '', condition_physical: '', features: '',
      hook_description: '',
      img1: '', img2: '', img3: '', img4: '', img5: ''
    });
    setShowLaptopModal(true);
  };

  const openEditModal = (laptop) => {
    setEditingLaptop(laptop);
    const gallery = (laptop.images || '').split(',').map(s => s.trim());
    setFormData({
      ...laptop,
      img1: gallery[0] || '', img2: gallery[1] || '', img3: gallery[2] || '', 
      img4: gallery[3] || '', img5: gallery[4] || ''
    });
    setShowLaptopModal(true);
  };

  const handleSaveLaptop = async (e) => {
    e.preventDefault();
    setSaving(true);
    const galleryArray = [formData.img1, formData.img2, formData.img3, formData.img4, formData.img5].filter(url => url.trim() !== '');
    
    // Siapkan data untuk dikirim
    const payload = { ...formData, images: galleryArray.join(','), harga: parseInt(formData.harga) };
    
    // Hapus data temporer img1-img5 agar tidak error di database
    ['img1', 'img2', 'img3', 'img4', 'img5'].forEach(k => delete payload[k]);

    try {
      const { error } = editingLaptop 
        ? await supabase.from('laptops').update(payload).eq('id', editingLaptop.id)
        : await supabase.from('laptops').insert(payload);
      if (error) throw error;
      fetchLaptops();
      setShowLaptopModal(false);
    } catch (error) { alert(error.message); } finally { setSaving(false); }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('settings').upsert({ id: 1, ...settings });
      if (error) throw error;
      setShowSettingsModal(false);
      fetchSettings(); // Refresh data toko setelah update
    } catch (error) { alert(error.message); } finally { setSaving(false); }
  };

  // ============================================================
  // [4] LAYOUT UTAMA (MAIN UI)
  // Tampilan Sidebar dan Konten Inventaris
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      
      {/* 4.A SIDEBAR (Desktop) & BOTTOM NAV (Mobile) */}
      <aside className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-2 md:relative md:w-64 md:h-screen md:border-t-0 md:border-r md:p-6 flex flex-row md:flex-col justify-around md:justify-start gap-2">
        
        {/* Logo (Desktop Only) */}
        <div className="hidden md:flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div className="overflow-hidden">
            <h2 className="font-bold text-sm truncate">{settings.shop_name || 'Admin Panel'}</h2>
            <p className="text-[10px] text-slate-500 uppercase">Dashboard</p>
          </div>
        </div>

        {/* Menu Buttons */}
        <button onClick={openAddModal} className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 md:bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-all text-[10px] md:text-sm font-medium flex-1 md:flex-none">
          <Plus className="w-5 h-5" /> <span className="md:inline">Tambah</span>
        </button>

        <button onClick={() => setShowSettingsModal(true)} className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 hover:bg-white/5 rounded-xl transition-all text-[10px] md:text-sm text-slate-400 md:text-white flex-1 md:flex-none">
          <Settings className="w-5 h-5" /> <span className="md:inline">Toko</span>
        </button>

        <button onClick={() => navigate('/')} className="flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 hover:bg-white/5 rounded-xl transition-all text-[10px] md:text-sm text-blue-400 flex-1 md:flex-none">
          <Home className="w-5 h-5" /> <span className="md:inline">Beranda</span>
        </button>
      </aside>

      {/* 4.B DAFTAR INVENTARIS (CONTENT) */}
      <main className="flex-1 p-4 md:p-10 mb-20 md:mb-0 overflow-x-hidden">
        <header className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Inventory Laptop</h1>
          <p className="text-sm md:text-base text-slate-400">{settings.shop_tagline || 'Kelola stok dan harga laptop Anda'}</p>
        </header>

        {/* Tabel yang Beradaptasi ke Card di Mobile */}
        <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-12 bg-white/5 p-4 text-xs uppercase font-bold text-slate-400 tracking-wider">
            <div className="col-span-6">Produk & Harga</div>
            <div className="col-span-4">Spesifikasi</div>
            <div className="col-span-2 text-right">Aksi</div>
          </div>

          <div className="divide-y divide-white/5">
            {laptops.map(laptop => (
              <div key={laptop.id} className="grid grid-cols-1 md:grid-cols-12 p-4 md:items-center hover:bg-white/5 gap-4">
                {/* Produk */}
                <div className="col-span-6 flex items-center gap-4">
                  <img src={laptop.link_gambar} className="w-14 h-14 md:w-12 md:h-12 rounded-xl object-cover border border-white/10" />
                  <div>
                    <h3 className="font-bold text-white leading-tight md:text-base text-sm">{laptop.nama}</h3>
                    <p className="text-indigo-400 font-bold text-sm">Rp {laptop.harga?.toLocaleString()}</p>
                  </div>
                </div>
                {/* Spek */}
                <div className="col-span-4 text-xs md:text-sm text-slate-400">
                  <span className="md:hidden font-bold text-slate-500 block mb-1 uppercase">Spesifikasi:</span>
                  {laptop.processor} • {laptop.ram} • {laptop.storage}
                </div>
                {/* Aksi */}
                <div className="col-span-2 flex justify-end gap-2">
                  <button onClick={() => openEditModal(laptop)} className="flex-1 md:flex-none p-3 md:p-2 bg-slate-800 rounded-xl hover:text-indigo-400 transition-colors flex justify-center border border-white/5">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => { if (confirm('Hapus unit ini?')) supabase.from('laptops').delete().eq('id', laptop.id).then(fetchLaptops) }} className="flex-1 md:flex-none p-3 md:p-2 bg-slate-800 rounded-xl hover:text-red-400 transition-colors flex justify-center border border-white/5">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ============================================================
          [5] MODAL TAMBAH/EDIT LAPTOP
          Muncul dari bawah di HP (Bottom Sheet Style)
          ============================================================ */}
      {showLaptopModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60] flex justify-center items-end md:items-center p-0 md:p-4">
          <div className="bg-slate-900 border-t md:border border-white/10 w-full max-w-4xl h-[92vh] md:h-auto md:max-h-[90vh] overflow-y-auto rounded-t-[2.5rem] md:rounded-3xl p-6 md:p-10 shadow-2xl shadow-indigo-500/10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg"><Laptop className="text-indigo-400" /></div>
                {editingLaptop ? 'Edit Data Laptop' : 'Unit Baru'}
              </h2>
              <button onClick={() => setShowLaptopModal(false)} className="p-2 bg-white/5 rounded-full hover:rotate-90 transition-all"><X /></button>
            </div>

            <form onSubmit={handleSaveLaptop} className="space-y-6 pb-20 md:pb-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Nama Unit</label>
                  <input required placeholder="MacBook Air M1" value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl mt-1 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Harga (IDR)</label>
                  <input type="number" required placeholder="10000000" value={formData.harga} onChange={e => setFormData({ ...formData, harga: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl mt-1 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-3xl">
                <label className="text-[10px] font-bold text-indigo-400 flex items-center gap-2 mb-3 uppercase tracking-widest"><Sparkles size={14} /> Keunggulan (Hook)</label>
                <textarea rows="3" placeholder="Sangat mulus, garansi panjang..." value={formData.hook_description} onChange={e => setFormData({ ...formData, hook_description: e.target.value })} className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-white italic text-sm" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 p-5 rounded-3xl border border-white/5">
                {[
                  { label: 'Prosesor', key: 'processor' }, { label: 'RAM', key: 'ram' },
                  { label: 'Storage', key: 'storage' }, { label: 'Layar', key: 'display' },
                  { label: 'Batre', key: 'battery_health' }, { label: 'Kondisi', key: 'condition_physical' },
                  { label: 'Kategori', key: 'kategori' }, { label: 'Fitur', key: 'features' }
                ].map((item) => (
                  <div key={item.key}>
                    <label className="text-[9px] text-slate-500 uppercase font-bold block mb-1">{item.label}</label>
                    <input placeholder="..." value={formData[item.key]} onChange={e => setFormData({ ...formData, [item.key]: e.target.value })} className="w-full bg-transparent border-b border-white/10 py-1 focus:border-indigo-500 text-xs text-white outline-none" />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Foto Galeri (Link URL)</label>
                <input required placeholder="Link gambar utama" value={formData.link_gambar} onChange={e => setFormData({ ...formData, link_gambar: e.target.value })} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs" />
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <input key={i} placeholder={`Link ${i}`} value={formData[`img${i}`]} onChange={e => setFormData({ ...formData, [`img${i}`]: e.target.value })} className="bg-white/5 border border-white/10 p-2 rounded-lg text-[8px] focus:outline-none" />
                  ))}
                </div>
              </div>

              <button type="submit" disabled={saving} className="w-full bg-indigo-600 p-4 rounded-2xl font-bold hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2">
                <Save size={20} /> {saving ? 'Sedang Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          [6] MODAL PENGATURAN TOKO (BRANDING)
          ============================================================ */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex justify-center items-center p-4 z-[70]">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg"><Store className="text-indigo-400" /></div> Branding Toko
              </h2>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 bg-white/5 rounded-full"><X size={20}/></button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block ml-1">Nama Toko</label>
                <input required value={settings.shop_name} onChange={e => setSettings({ ...settings, shop_name: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block ml-1">Slogan Toko</label>
                <input value={settings.shop_tagline} onChange={e => setSettings({ ...settings, shop_tagline: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block ml-1">WhatsApp (Tanpa 0 / +62)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">+62</span>
                  <input type="text" value={settings.whatsapp} onChange={e => setSettings({ ...settings, whatsapp: e.target.value })} className="w-full bg-white/5 border border-white/10 p-4 pl-14 rounded-2xl text-green-400 font-bold outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full bg-indigo-600 p-4 rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2">
                <Save size={18} /> {saving ? 'Menyimpan...' : 'Update Profil Toko'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;