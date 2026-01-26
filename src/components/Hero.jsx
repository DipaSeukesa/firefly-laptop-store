import React, { useState } from 'react';
import { Search, Laptop } from 'lucide-react'; 

const Hero = ({ onSearch, logo, settings }) => { 
  // ==========================================
  // BAGIAN A: STATE & LOGIC (Fungsi Pencarian)
  // ==========================================
  const [searchQuery, setSearchQuery] = useState('');

  // Fungsi: Menangani submit form (saat tekan Enter)
  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  // Fungsi: Menangani perubahan input (Live Search)
  const handleChange = (e) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  // ==========================================
  // BAGIAN B: TAMPILAN (Render UI)
  // ==========================================
  return (
    <header className="relative overflow-hidden bg-transparent text-white">
      
      {/* 1. Efek Visual: Cahaya Aurora di belakang (Soft Glow) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[120px]"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 pt-32">
        <div className="text-center">
          
          {/* 2. Brand Identity: Logo Toko atau Ikon Cadangan */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              {/* Efek Cahaya di belakang logo/ikon */}
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              
              <div className="relative animate-float">
                {/* LOGIKA LOGO: 
                   Jika 'logo' ada nilainya (dari settings admin), tampilkan <img>.
                   Jika kosong, tampilkan ikon Laptop dari Lucide.
                */}
                {logo ? (
                  <img 
                    src={logo} 
                    alt="Logo Toko" 
                    className="h-32 md:h-40 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                    /* ^^^ h-32 untuk HP, h-40 untuk Desktop agar lebih proporsional */ 
                  />
                ) : (
                  <div className="p-8 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-sm shadow-2xl">
                    <Laptop size={100} className="text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.5)]" />
                    {/* ^^^ size 100 akan membuatnya terlihat jauh lebih gagah */}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. Typography: Nama Toko & Slogan Dinamis 26 januari 2026*/}
<h1 className="font-display text-5xl md:text-7xl font-extrabold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
  {settings?.shop_name || "Firefly Laptop"}
</h1>

<p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
  {settings?.shop_tagline ? (
    settings.shop_tagline
  ) : (
    <>
      Temukan performa terbaik dalam kegelapan. 
      <span className="text-blue-400 font-semibold"> Kualitas tinggi </span> 
      yang langka seperti cahaya kunang-kunang.
    </>
  )}
</p>
          
          {/* 4. Interaksi: Bar Pencarian (Glassmorphism) */}
          <div className="max-w-xl mx-auto relative group">
            <form onSubmit={handleSearch} className="relative z-10">
              <input
                type="text"
                value={searchQuery}
                onChange={handleChange}
                placeholder="Cari laptop impianmu..."
                className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white 
                           placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                           focus:bg-white/10 transition-all backdrop-blur-md shadow-2xl"
              />
              <button
                type="submit"
                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                <Search className="w-6 h-6" />
              </button>
            </form>
            {/* Dekorasi: Glow saat input aktif */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Hero;