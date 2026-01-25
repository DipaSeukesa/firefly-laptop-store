import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  Settings, 
  Laptop, 
  X,
  Save,
  Phone,
  Image as ImageIcon
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [laptops, setLaptops] = useState([]);
  const [settings, setSettings] = useState({ whatsapp: '', logo: '' });
  const [loading, setLoading] = useState(true);
  const [showLaptopModal, setShowLaptopModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    harga: '',
    deskripsi: '',
    link_gambar: '',
    kategori: ''
  });

  useEffect(() => {
    fetchLaptops();
    fetchSettings();
  }, []);

  const fetchLaptops = async () => {
    try {
      const { data, error } = await supabase
        .from('laptops')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching laptops:', error);
        setLaptops([]);
        return;
      }
      setLaptops(data || []);
    } catch (error) {
      console.error('Error fetching laptops:', error);
      setLaptops([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        return;
      }
      
      if (data) {
        setSettings({
          whatsapp: data.whatsapp || '',
          logo: data.logo || ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettings({ whatsapp: '', logo: '' });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/admin/login');
    }
  };

  const openAddModal = () => {
    setEditingLaptop(null);
    setFormData({
      nama: '',
      harga: '',
      deskripsi: '',
      link_gambar: '',
      kategori: ''
    });
    setShowLaptopModal(true);
  };

  const openEditModal = (laptop) => {
    setEditingLaptop(laptop);
    setFormData({
      nama: laptop.nama || '',
      harga: laptop.harga || '',
      deskripsi: laptop.deskripsi || '',
      link_gambar: laptop.link_gambar || '',
      kategori: laptop.kategori || ''
    });
    setShowLaptopModal(true);
  };

  const handleSaveLaptop = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      if (editingLaptop) {
        // Update existing laptop
        const { error } = await supabase
          .from('laptops')
          .update({
            nama: formData.nama,
            harga: parseInt(formData.harga),
            deskripsi: formData.deskripsi,
            link_gambar: formData.link_gambar,
            kategori: formData.kategori
          })
          .eq('id', editingLaptop.id);

        if (error) throw error;
      } else {
        // Insert new laptop
        const { error } = await supabase
          .from('laptops')
          .insert({
            nama: formData.nama,
            harga: parseInt(formData.harga),
            deskripsi: formData.deskripsi,
            link_gambar: formData.link_gambar,
            kategori: formData.kategori
          });

        if (error) throw error;
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setShowLaptopModal(false);
        setSaveSuccess(false);
        fetchLaptops();
      }, 1000);
    } catch (error) {
      console.error('Error saving laptop:', error);
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLaptop = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus laptop ini?')) return;

    try {
      const { error } = await supabase
        .from('laptops')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchLaptops();
    } catch (error) {
      console.error('Error deleting laptop:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 1,
          whatsapp: settings.whatsapp,
          logo: settings.logo
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
      
      setSaveSuccess(true);
      setTimeout(() => {
        setShowSettingsModal(false);
        setSaveSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg font-medium">Memuat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Laptop className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-display text-xl font-bold text-white">Admin Panel</h2>
            </div>
            <p className="text-slate-300 text-sm">Firefly Laptop Store</p>
          </div>

          <nav className="space-y-2 flex-1">
            <button
              onClick={openAddModal}
              className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-3 text-left"
            >
              <Plus className="w-5 h-5" />
              Tambah Laptop
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium text-sm transition-all flex items-center gap-3 text-left border border-white/10"
            >
              <Settings className="w-5 h-5" />
              Pengaturan Toko
            </button>
          </nav>

          <div className="pt-4">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 rounded-xl font-medium text-sm transition-all flex items-center gap-3 text-left border border-red-500/30 text-red-300"
            >
              <LogOut className="w-5 h-5" />
              Keluar
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-300 text-base">Kelola data laptop dan pengaturan toko</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm font-medium mb-2">Total Laptop</p>
                  <p className="text-4xl font-bold text-white">{laptops.length}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                  <Laptop className="w-7 h-7 text-indigo-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Laptops Table */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Nama</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Kategori</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Harga</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Gambar</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-200">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {laptops.map((laptop) => (
                    <tr key={laptop.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white text-base mb-1">{laptop.nama}</div>
                        <div className="text-sm text-slate-300 line-clamp-1">{laptop.deskripsi}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 bg-indigo-500/20 text-indigo-200 rounded-lg text-sm font-medium border border-indigo-500/30">
                          {laptop.kategori}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-white text-base">{formatPrice(laptop.harga)}</td>
                      <td className="px-6 py-4">
                        {laptop.link_gambar ? (
                          <img
                            src={laptop.link_gambar}
                            alt={laptop.nama}
                            className="w-16 h-16 object-cover rounded-lg border border-white/10"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(laptop)}
                            className="p-2.5 bg-indigo-600/80 hover:bg-indigo-600 rounded-lg transition-colors border border-indigo-500/30"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={() => handleDeleteLaptop(laptop.id)}
                            className="p-2.5 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors border border-red-500/30"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {laptops.length === 0 && (
                <div className="text-center py-16">
                  <Laptop className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400 text-base">Belum ada data laptop. Klik "Tambah Laptop" untuk menambah data.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Laptop Modal */}
      {showLaptopModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowLaptopModal(false)}>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-display font-bold text-white">
                {editingLaptop ? 'Edit Laptop' : 'Tambah Laptop'}
              </h2>
              <button
                onClick={() => setShowLaptopModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {saveSuccess && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200 text-sm font-medium backdrop-blur-sm">
                ✓ Data berhasil disimpan!
              </div>
            )}

            <form onSubmit={handleSaveLaptop} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Nama Laptop</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white/15 transition-all"
                  placeholder="Contoh: MacBook Pro 14&quot;"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Harga (Rupiah)</label>
                <input
                  type="number"
                  value={formData.harga}
                  onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white/15 transition-all"
                  placeholder="25000000"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Deskripsi</label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white/15 transition-all resize-none"
                  placeholder="Deskripsi lengkap laptop..."
                  rows="4"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Link Gambar</label>
                <input
                  type="url"
                  value={formData.link_gambar}
                  onChange={(e) => setFormData({ ...formData, link_gambar: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white/15 transition-all"
                  placeholder="https://example.com/image.jpg"
                  required
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Kategori</label>
                <input
                  type="text"
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white/15 transition-all"
                  placeholder="Gaming, Ultrabook, Budget, dll"
                  required
                  disabled={saving}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl font-semibold text-base hover:shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Simpan
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLaptopModal(false)}
                  disabled={saving}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-medium text-base transition-all border border-white/10 disabled:opacity-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowSettingsModal(false)}>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-display font-bold text-white">Pengaturan Toko</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {saveSuccess && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200 text-sm font-medium backdrop-blur-sm">
                ✓ Settings berhasil disimpan!
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Nomor WhatsApp Admin
                </label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white/15 transition-all"
                  placeholder="6281234567890 (tanpa +)"
                  required
                  disabled={saving}
                />
                <p className="mt-2 text-xs text-slate-400">Format: 6281234567890 (tanpa + atau spasi)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Link Logo
                </label>
                <input
                  type="url"
                  value={settings.logo}
                  onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white/15 transition-all"
                  placeholder="https://example.com/logo.png"
                  disabled={saving}
                />
                {settings.logo && (
                  <div className="mt-3">
                    <img src={settings.logo} alt="Logo preview" className="w-32 h-32 object-contain rounded-lg bg-white/5 p-2 border border-white/10" />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl font-semibold text-base hover:shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Simpan Settings
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  disabled={saving}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-medium text-base transition-all border border-white/10 disabled:opacity-50"
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
