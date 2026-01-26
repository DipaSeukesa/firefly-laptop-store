import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Filter from '../components/Filter';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import ProductDetailModal from '../components/ProductDetailModal';
import { Laptop } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Home = () => {
  // ==========================================
  // BAGIAN A: STATE MANAGEMENT (Penyimpanan Data)
  // ==========================================
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({ whatsapp: '', logo: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // BAGIAN B: REALTIME SUBSCRIPTION (Sinkronisasi Otomatis)
  // ==========================================
  useEffect(() => {
    fetchLaptops();
    fetchSettings();

    const laptopsSubscription = supabase
      .channel('laptops-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'laptops' }, () => {
        fetchLaptops();
      })
      .subscribe();

    const settingsSubscription = supabase
      .channel('settings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(laptopsSubscription);
      supabase.removeChannel(settingsSubscription);
    };
  }, []);

  // ==========================================
  // BAGIAN C: DATA FETCHING (DIPERBARUI) 26 januari 2026
  // ==========================================
  const fetchLaptops = async () => {
    try {
      const { data, error } = await supabase
        .from('laptops')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map(laptop => ({
        id: laptop.id,
        name: laptop.nama || '',
        brand: laptop.kategori || 'Laptop',
        category: laptop.kategori || 'Lainnya',
        price: laptop.harga || 0,
        // Ambil data spesifikasi asli dari database
        processor: laptop.processor || 'Internal',
        ram: laptop.ram || '-',
        storage: laptop.storage || '-',
        display: laptop.display || '-',
        battery: laptop.battery_health || '-',
        condition_text: laptop.condition_physical || '-',
        features: laptop.features || '-',
        // Ambil Deskripsi Rekomendasi (Hook)
        hook: laptop.hook_description || '', 
        // Gabungkan Thumbnail + Gallery Images
        images: [
          laptop.link_gambar, 
          ...(laptop.images ? laptop.images.split(',') : [])
        ].filter(url => url && url.trim() !== ''),
        summary: laptop.deskripsi || '',
        description: laptop.deskripsi || '',
        link_gambar: laptop.link_gambar || ''
      }));

      setProducts(transformedData);
    } catch (error) {
      console.error('Error fetching laptops:', error);
      setProducts([]);
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

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings({
          whatsapp: data.whatsapp || '',
          logo: data.logo || '',
          // TAMBAHKAN INI AGAR HERO BISA DINAMIS
          shop_name: data.shop_name || '',
          shop_tagline: data.shop_tagline || ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettings({ whatsapp: '', logo: '', shop_name: '', shop_tagline: '' });
    }
  };

  // ==========================================
  // BAGIAN D: FILTER & SEARCH LOGIC (Fungsi Penyaringan)
  // ==========================================
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return cats.sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  // ==========================================
  // BAGIAN E: EVENT HANDLERS (Aksi Klik User)
  // ==========================================
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const handleViewDetails = (product) => {
    setSelectedProduct({ ...product, whatsapp: settings.whatsapp });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // ==========================================
  // BAGIAN F: TAMPILAN (Render UI)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-900 overflow-auto scroll-smooth">
      {/* 1. Latar Belakang Alam (Siluet Kebun & Hutan Luas) */}
{/* 1. Latar Belakang Alam (Siluet Kebun & Hutan Luas - Statis) */}
<div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
  <div className="absolute bottom-0 left-0 right-0 h-[70%]">
    
    {/* LAYER 3: Pohon Belakang (Kecil & Banyak - Kesan Jauh) */}
    <div className="absolute bottom-32 left-0 right-0 flex justify-around opacity-10">
      {[0.5, 0.4, 0.6, 0.4, 0.5, 0.7, 0.4, 0.6, 0.5, 0.4, 0.6, 0.5].map((sc, i) => (
        <div key={`tree-bg-${i}`} style={{ transform: `scale(${sc})` }}>
          <svg width="60" height="100" viewBox="0 0 60 100">
            <polygon points="30,5 5,85 55,85" fill="#000000" />
            <rect x="27" y="85" width="6" height="15" fill="#000000" />
          </svg>
        </div>
      ))}
    </div>

    {/* LAYER 2: Pohon Tengah (Sedang) */}
    <div className="absolute bottom-16 left-0 right-0 flex justify-around opacity-30">
      {[0.0, 0.9, 1.3, 1.0].map((sc, i) => (
        <div key={`tree-md-${i}`} style={{ transform: `scale(${sc})` }}>
          <svg width="80" height="130" viewBox="0 0 85 140">
            <polygon points="42,5 10,50 25,50 2,100 83,100 60,50 75,50" fill="#000000" />
            <rect x="38" y="100" width="9" height="40" fill="#000000" />
          </svg>
        </div>
      ))}
    </div>

    {/* LAYER 1: Pohon Depan (Besar & Dominan) */}
    <div className="absolute bottom-0 left-0 right-0 flex justify-between px-16 opacity-60">
      {[1.5].map((sc, i) => (
        <div key={`tree-fg-${i}`} style={{ transform: `scale(${sc})` }}>
          <svg width="110" height="300" viewBox="0 0 95 180">
            <polygon points="48,5 15,60 30,60 5,120 90,120 65,60 80,60" fill="#000000" />
            <rect x="42" y="120" width="12" height="60" fill="#000000" />
          </svg>
        </div>
      ))}
    </div>

    {/* Efek Kabut/Tanah Gelap */}
    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
  </div>
</div>

      {/* 2. Efek Cahaya Kunang-kunang */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="firefly"
          style={{
            position: 'fixed',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #ffd700 0%, #ffed4e 30%, transparent 70%)',
            boxShadow: '0 0 10px #ffd700, 0 0 20px #ffd700, 0 0 30px #ffed4e, 0 0 40px #ffed4e',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: 0,
            left: `${10 + i * 12}%`,
            animation: `firefly-fly ${15 + i * 2}s infinite ease-in-out`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}

      {/* 3. Navbar Header */}
      <Navbar logo={settings.logo} />
      
      <div className="relative z-10">
        {/* 4. Bagian Hero (Headline & Search) */}
        <Hero onSearch={handleSearch} logo={settings.logo} settings={settings} />
        
        {/* 5. Bagian Filter Kategori */}
        <Filter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          productCount={filteredProducts.length}
        />

        {/* 6. Daftar Produk (Grid) */}
        <main className="max-w-7xl mx-auto px-6 pb-16">
          {loading ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-6 animate-float">
                <Laptop className="w-20 h-20 mx-auto text-slate-400" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">Memuat...</h3>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{ ...product, whatsapp: settings.whatsapp }}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-8xl mb-6 animate-float">
                <Laptop className="w-20 h-20 mx-auto text-slate-400" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">
                {searchQuery ? 'Tidak Ditemukan' : 'Belum Ada Produk'}
              </h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                {searchQuery ? 'Coba kata kunci lain' : 'Produk akan muncul di sini'}
              </p>
            </div>
          )}
        </main>

        {/* 7. Footer */}
        <Footer whatsapp={settings.whatsapp} />
      </div>

      {/* 8. Modal Pop-up Detail */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Home;