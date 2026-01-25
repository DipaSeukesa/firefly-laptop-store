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
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({ whatsapp: '', logo: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaptops();
    fetchSettings();

    // Subscribe to real-time changes
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

  const fetchLaptops = async () => {
    try {
      const { data, error } = await supabase
        .from('laptops')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching laptops:', error);
        setProducts([]);
        return;
      }

      // Transform data to match existing product structure
      const transformedData = (data || []).map(laptop => ({
        id: laptop.id,
        name: laptop.nama || '',
        brand: laptop.kategori || 'Laptop',
        category: laptop.kategori || 'Lainnya',
        price: laptop.harga || 0,
        processor: 'Lihat detail',
        ram: 'Lihat detail',
        storage: 'Lihat detail',
        display: 'Lihat detail',
        images: laptop.link_gambar ? [laptop.link_gambar] : [],
        condition: 'Baru',
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
      // Set default settings if error
      setSettings({ whatsapp: '', logo: '' });
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return cats.sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

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

  return (
    <div className="min-h-screen bg-slate-900 overflow-auto scroll-smooth">
      {/* Nature Background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ overflow: 'hidden' }}>
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '60%' }}>
          <div className="absolute bottom-24 left-[5%] opacity-30">
            <svg width="60" height="100" viewBox="0 0 60 100">
              <polygon points="30,10 10,50 20,50 0,90 20,90 20,100 40,100 40,90 60,90 40,50 50,50" fill="#000000" />
            </svg>
          </div>
          <div className="absolute bottom-24 right-[20%] opacity-30">
            <svg width="55" height="90" viewBox="0 0 55 90">
              <polygon points="27,8 9,45 17,45 2,80 17,80 17,90 37,90 37,80 52,80 37,45 45,45" fill="#000000" />
            </svg>
          </div>
          <div className="absolute bottom-8 left-[10%] opacity-70">
            <svg width="85" height="140" viewBox="0 0 85 140">
              <rect x="37" y="90" width="11" height="50" fill="#000000" />
              <polygon points="42,10 15,60 28,60 8,105 28,105 28,95 57,95 57,105 77,105 57,60 70,60" fill="#000000" />
            </svg>
          </div>
          <div className="absolute bottom-4 left-[3%] opacity-80">
            <svg width="95" height="180" viewBox="0 0 95 180">
              <rect x="42" y="120" width="12" height="60" fill="#000000" />
              <polygon points="48,5 18,70 32,70 10,130 32,130 32,125 64,125 64,130 85,130 63,70 77,70" fill="#000000" />
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: 'linear-gradient(to top, #000000 0%, transparent 100%)' }}></div>
        </div>
      </div>

      {/* Firefly Animation Background */}
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

      <Navbar logo={settings.logo} />
      
      <div className="relative z-10">
        <Hero onSearch={handleSearch} />
        
        <Filter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          productCount={filteredProducts.length}
        />

        <main className="max-w-7xl mx-auto px-6 pb-16">
          {loading ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-6 animate-float">
                <Laptop className="w-20 h-20 mx-auto text-slate-400" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">
                Memuat...
              </h3>
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
                {searchQuery
                  ? 'Coba kata kunci atau kategori lain'
                  : 'Produk akan muncul di sini'}
              </p>
            </div>
          )}
        </main>

        <Footer whatsapp={settings.whatsapp} />
      </div>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Home;
