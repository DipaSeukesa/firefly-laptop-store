import React from 'react';
import { Heart, Phone } from 'lucide-react';

const Footer = ({ whatsapp }) => {
  // ==========================================
  // FUNGSI: Navigasi ke WhatsApp
  // Membersihkan karakter non-angka dan membuka tab baru
  // ==========================================
  const handleWhatsAppClick = () => {
    if (whatsapp) {
      const waNumber = whatsapp.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${waNumber}`, '_blank');
    }
  };

  return (
    // BAGIAN: Container Utama (Menggunakan bg-transparent dan backdrop-blur agar estetik)
    <footer className="bg-transparent text-white py-12 mt-16 border-t border-white/5 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          
          {/* BAGIAN: Branding Toko (Tanpa Ikon Api) */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <h3 className="font-display text-2xl font-bold tracking-tight">
              Firefly Laptop Store
            </h3>
          </div>

          {/* BAGIAN: Tombol Kontak Dinamis */}
          {whatsapp && (
            <div className="mb-10">
              <button
                onClick={handleWhatsAppClick}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-medium transition-all flex items-center gap-2 mx-auto group"
              >
                <Phone className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                <span>Hubungi via WhatsApp</span>
              </button>
            </div>
          )}

          {/* BAGIAN: Credit & Made With */}
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mb-4">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
            <span>for laptop enthusiasts</span>
          </div>

          {/* BAGIAN: Copyright & Watermark Nama (Kadek Dipa Sukesa) */}
          <div className="pt-6 border-t border-white/5 text-slate-600 text-[10px] uppercase tracking-[0.2em]">
            © 2026 Firefly Laptop Store. Developed by 
            <span className="text-slate-400 ml-1 font-bold">Kadek Dipa Sukesa</span>. 
            All rights reserved.
          </div>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;