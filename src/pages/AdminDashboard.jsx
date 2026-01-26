import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Plus, Edit, Trash2, LogOut, Settings, Laptop, X, 
  Save, Phone, Image as ImageIcon, Store, Cpu, HardDrive, Monitor, Sparkles
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // --- BAGIAN 1: STATE MANAGEMENT ---
  // Tempat menyimpan data sementara sebelum dikirim ke database
  const [laptops, setLaptops] = useState([]);
  const [settings, setSettings] = useState({ 
    whatsapp: '', 
    logo: '', 
    shop_name: '', 
    shop_tagline: '' 
  });
  const [loading, setLoading] = useState(true);
  const [showLaptopModal, setShowLaptopModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form Data untuk Laptop (Termasuk kolom Hook baru)
  const [formData, setFormData] = useState({
    nama: '', harga: '', deskripsi: '', link_gambar: '', kategori: '',
    processor: '', ram: '', storage: '', display: '', 
    battery_health: '', condition_physical: '', features: '',
    hook_description: '', // Kolom Baru untuk "Deskripsi Rekomendasi"
    img1: '', img2: '', img3: '', img4: '', img5: '' 
  });

  // --- BAGIAN 2: DATA FETCHING ---
  // Fungsi untuk mengambil data dari Supabase saat halaman dibuka
  useEffect(() => {
    fetchLaptops();
    fetchSettings();
  }, []);

  const fetchLaptops = async () => {
    try {
      const { data, error } = await supabase.from('laptops').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setLaptops(data || []);
    } catch (error) {
      console.error(error);
    } finally { setLoading(false); }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*').single();
      if (data) {
        setSettings({
          whatsapp: data.whatsapp || '',
          logo: data.logo || '',
          shop_name: data.shop_name || '',
          shop_tagline: data.shop_tagline || ''
        });
      }
    } catch (error) { console.error(error); }
  };

  // --- BAGIAN 3: LOGIC MODAL & HANDLERS ---
  // Mengatur buka tutup jendela pop-up (Tambah/Edit)
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
      img1: gallery[0] || '',
      img2: gallery[1] || '',
      img3: gallery[2] || '',
      img4: gallery[3] || '',
      img5: gallery[4] || ''
    });
    setShowLaptopModal(true);
  };

  // --- BAGIAN 4: SIMPAN DATA KE SUPABASE ---
  const handleSaveLaptop = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Gabungkan 5 textbox gambar menjadi 1 string dipisah koma
    const galleryArray = [formData.img1, formData.img2, formData.img3, formData.img4, formData.img5]
      .filter(url => url.trim() !== '');
    
    const payload = {
      nama: formData.nama,
      harga: parseInt(formData.harga),
      deskripsi: formData.deskripsi,
      link_gambar: formData.link_gambar,
      images: galleryArray.join(','),
      kategori: formData.kategori,
      processor: formData.processor,
      ram: formData.ram,
      storage: formData.storage,
      display: formData.display,
      battery_health: formData.battery_health,
      condition_physical: formData.condition_physical,
      features: formData.features,
      hook_description: formData.hook_description // Data baru
    };

    try {
      const { error } = editingLaptop 
        ? await supabase.from('laptops').update(payload).eq('id', editingLaptop.id)
        : await supabase.from('laptops').insert(payload);

      if (error) throw error;
      fetchLaptops();
      setShowLaptopModal(false);
    } catch (error) {
      alert(error.message);
    } finally { setSaving(false); }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('settings').upsert({ id: 1, ...settings });
      if (error) throw error;
      setShowSettingsModal(false);
    } catch (error) {
      alert(error.message);
    } finally { setSaving(false); }
  };

  // --- BAGIAN 5: TAMPILAN (UI) ---
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar - Menu Samping */}
      <aside className="w-64 bg-slate-900 border-r border-white/10 p-6 flex flex-col fixed h-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">{settings.shop_name || 'Admin Panel'}</h2>
            <p className="text-xs text-slate-400">Control Center</p>
          </div>
        </div>

        <nav className="space-y-3 flex-1">
          <button onClick={openAddModal} className="w-full p-3 bg-indigo-600 rounded-xl flex items-center gap-3 hover:bg-indigo-500 transition-all font-medium">
            <Plus className="w-5 h-5" /> Tambah Laptop
          </button>
          <button onClick={() => setShowSettingsModal(true)} className="w-full p-3 bg-white/5 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-all">
            <Settings className="w-5 h-5" /> Pengaturan Toko
          </button>
        </nav>

        <button onClick={() => supabase.auth.signOut()} className="w-full p-3 text-red-400 flex items-center gap-3 hover:bg-red-500/10 rounded-xl">
          <LogOut className="w-5 h-5" /> Keluar
        </button>
      </aside>

      {/* Main Content - Tabel Data */}
      <main className="flex-1 ml-64 p-8">
        <header className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Inventory Laptop</h1>
          <p className="text-slate-400">{settings.shop_tagline || 'Kelola stok dan harga laptop Anda'}</p>
        </header>

        <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-400 text-sm uppercase">
              <tr>
                <th className="p-4">Produk</th>
                <th className="p-4">Spesifikasi Utama</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {laptops.map(laptop => (
                <tr key={laptop.id} className="hover:bg-white/5">
                  <td className="p-4 flex items-center gap-4">
                    <img src={laptop.link_gambar} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                    <div>
                      <div className="font-bold">{laptop.nama}</div>
                      <div className="text-indigo-400 text-sm">Rp {laptop.harga?.toLocaleString()}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-400">
                    {laptop.processor} | {laptop.ram} | {laptop.storage}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(laptop)} className="p-2 bg-slate-800 rounded-lg hover:text-indigo-400"><Edit size={18} /></button>
                      <button onClick={() => { if(confirm('Hapus unit ini?')) supabase.from('laptops').delete().eq('id', laptop.id).then(fetchLaptops)}} className="p-2 bg-slate-800 rounded-lg hover:text-red-400"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* --- MODAL TAMBAH/EDIT LAPTOP --- */}
      {showLaptopModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center items-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Laptop className="text-indigo-500" /> {editingLaptop ? 'Edit Data Laptop' : 'Tambah Unit Baru'}
              </h2>
              <button onClick={() => setShowLaptopModal(false)} className="hover:rotate-90 transition-transform"><X /></button>
            </div>
            
            <form onSubmit={handleSaveLaptop} className="space-y-6">
              {/* Input Dasar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-400">Nama Unit Laptop</label>
                  <input required placeholder="Contoh: MacBook Pro M2 2023" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl mt-1 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Harga (IDR)</label>
                  <input type="number" required placeholder="12500000" value={formData.harga} onChange={e => setFormData({...formData, harga: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl mt-1 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              {/* BARU: Kolom Hook Deskripsi (Panjang & Lebar) */}
              <div className="bg-indigo-500/5 border border-indigo-500/20 p-5 rounded-2xl">
                <label className="text-sm font-bold text-indigo-300 flex items-center gap-2 mb-2 uppercase">
                  <Sparkles size={16} /> Rekomendasi & Alasan Beli (Hook ke Customer)
                </label>
                <textarea 
                  rows="4" 
                  placeholder="Contoh: Laptop ini sangat cocok untuk editing video 4K tanpa lag. Kondisi mulus banget seperti baru keluar dari box!" 
                  value={formData.hook_description} 
                  onChange={e => setFormData({...formData, hook_description: e.target.value})} 
                  className="w-full bg-slate-950 border border-white/10 p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white italic"
                />
                <p className="text-[10px] text-slate-500 mt-2">*Tulisan ini akan muncul menonjol sebagai alasan kenapa pembeli harus memilih unit ini.</p>
              </div>

              {/* Grid Spesifikasi - Bagian 5 (Lengkap) */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/5 p-6 rounded-2xl border border-white/5">
  {/* Baris 1 */}
  <div>
    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Prosesor</label>
    <input placeholder="Core i7 Gen 12" value={formData.processor} onChange={e => setFormData({...formData, processor: e.target.value})} className="w-full bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-indigo-500 text-sm" />
  </div>
  <div>
    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">RAM</label>
    <input placeholder="16GB DDR5" value={formData.ram} onChange={e => setFormData({...formData, ram: e.target.value})} className="w-full bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-indigo-500 text-sm" />
  </div>
  <div>
    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Penyimpanan</label>
    <input placeholder="SSD 1TB NVMe" value={formData.storage} onChange={e => setFormData({...formData, storage: e.target.value})} className="w-full bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-indigo-500 text-sm" />
  </div>
  <div>
    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Layar</label>
    <input placeholder="15.6' 4K OLED" value={formData.display} onChange={e => setFormData({...formData, display: e.target.value})} className="w-full bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-indigo-500 text-sm" />
  </div>

  {/* Baris 2 */}
  <div>
    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Battery Health</label>
    <input placeholder="95% (Awet)" value={formData.battery_health} onChange={e => setFormData({...formData, battery_health: e.target.value})} className="w-full bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-indigo-500 text-sm" />
  </div>
  <div>
    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Kemulusan</label>
    <input placeholder="98% Like New" value={formData.condition_physical} onChange={e => setFormData({...formData, condition_physical: e.target.value})} className="w-full bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-indigo-500 text-sm" />
  </div>
  <div>
    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Kategori</label>
    <input placeholder="Gaming / Office" value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})} className="w-full bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-indigo-500 text-sm" />
  </div>
  <div>
    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Fitur Unggulan</label>
    <input placeholder="Fingerprint, RGB" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full bg-transparent border-b border-white/10 p-2 focus:outline-none focus:border-indigo-500 text-sm" />
  </div>
</div>

              {/* 1. Input Gambar Utama (Thumbnail) */}
  <div>
    <label className="text-sm text-slate-400 font-bold uppercase tracking-wider block mb-1">Thumbnail Utama (Wajib)</label>
    <div className="relative">
      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <input 
        required
        placeholder="Masukkan link gambar utama (untuk tampilan kartu produk)" 
        value={formData.link_gambar} 
        onChange={e => setFormData({...formData, link_gambar: e.target.value})} 
        className="w-full bg-white/5 border border-white/10 p-3 pl-10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
      />
    </div>
  </div>

  {/* 2. Galeri Pendukung (5 Textbox Opsional) */}
  <div>
    <label className="text-sm text-slate-400 block mb-2 font-bold uppercase tracking-wider">Galeri Tambahan (Opsional - Maks 5 Foto)</label>
    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i}>
          <input 
            placeholder={`Link Foto ${i}`} 
            value={formData[`img${i}`]} 
            onChange={e => setFormData({...formData, [`img${i}`]: e.target.value})} 
            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-[10px] focus:ring-1 focus:ring-indigo-500 outline-none" 
          />
        </div>
      ))}
    </div>
    <p className="text-[10px] text-slate-500 mt-2 italic">*Link ini akan menjadi galeri slide di halaman detail produk.</p>
  </div>

              <button type="submit" className="w-full bg-indigo-600 p-4 rounded-xl font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                <Save size={20} /> {saving ? 'Sedang Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL PENGATURAN TOKO (DIPERBARUI) --- */}
{showSettingsModal && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
    <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-fade-in-up">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <Store className="text-indigo-500" />
        </div> 
        Branding Toko
      </h2>
      
      <form onSubmit={handleSaveSettings} className="space-y-5">
        {/* Input: Nama Toko */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Nama Toko Anda</label>
          <input 
            value={settings.shop_name} 
            onChange={e => setSettings({...settings, shop_name: e.target.value})} 
            placeholder="Contoh: Firefly Laptop Store"
            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
          />
        </div>

        {/* Input: Slogan */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Slogan / Tagline Menarik</label>
          <input 
            value={settings.shop_tagline} 
            onChange={e => setSettings({...settings, shop_tagline: e.target.value})} 
            placeholder="Kualitas tinggi dalam kegelapan..."
            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
          />
        </div>

        {/* --- TAMBAHAN: INPUT NOMOR WHATSAPP --- */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Nomor WhatsApp Toko</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">+62</span>
            <input 
              type="text"
              value={settings.whatsapp} 
              onChange={e => setSettings({...settings, whatsapp: e.target.value})} 
              placeholder="8123456789"
              className="w-full bg-white/5 border border-white/10 p-3 pl-12 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-green-400 font-medium" 
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic">*Masukkan angka saja (tanpa 0 di depan atau +62)</p>
        </div>

        <div className="pt-2">
          <button className="w-full bg-indigo-600 p-4 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
            Update Identitas
          </button>
          <button 
            type="button" 
            onClick={() => setShowSettingsModal(false)} 
            className="w-full text-slate-400 text-sm mt-4 hover:text-white transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default AdminDashboard;