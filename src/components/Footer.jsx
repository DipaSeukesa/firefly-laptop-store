import React from 'react';
import { Heart, Phone } from 'lucide-react';

const Footer = ({ whatsapp }) => {
  const handleWhatsAppClick = () => {
    if (whatsapp) {
      const waNumber = whatsapp.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${waNumber}`, '_blank');
    }
  };

  return (
    <footer className="bg-slate-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="text-3xl firefly-glow">🔥</div>
            <h3 className="font-display text-2xl font-bold">Firefly Laptop Store</h3>
          </div>
          <p className="text-slate-400 mb-6">
            Kualitas Terbaik yang sulit Dicari di Tempat Lain
          </p>
          {whatsapp && (
            <div className="mb-6">
              <button
                onClick={handleWhatsAppClick}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium transition-all flex items-center gap-2 mx-auto"
              >
                <Phone className="w-5 h-5" />
                Hubungi via WhatsApp
              </button>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>for laptop enthusiasts</span>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800 text-slate-500 text-sm">
            © 2025 Firefly Laptop Store. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
