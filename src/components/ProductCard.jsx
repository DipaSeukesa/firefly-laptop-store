import React from 'react';
import { Laptop, MessageCircle, Eye } from 'lucide-react';

const ProductCard = ({ product, onViewDetails }) => {
  // ==========================================
  // BAGIAN A: LOGIC (Format Harga & Link WA)
  // ==========================================
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleWhatsAppClick = (e) => {
    e.stopPropagation(); // Mencegah modal detail terbuka saat klik WA
    if (product.whatsapp) {
      const waNumber = product.whatsapp.replace(/[^0-9]/g, '');
      const message = encodeURIComponent(
        `Halo, saya tertarik dengan ${product.name}. Apakah stok masih ada?`
      );
      window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
    }
  };

  // ==========================================
  // BAGIAN B: TAMPILAN (Render UI)
  // ==========================================
  return (
    <div 
      onClick={() => onViewDetails(product)}
      className="group relative bg-slate-900/40 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 hover:border-yellow-500/50 transition-all duration-500 cursor-pointer shadow-2xl"
    >
      {/* 1. Efek Glow Kunang-kunang (Pojok Kanan Atas) */}
      <div className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-500/20 blur-2xl group-hover:bg-yellow-500/40 transition-all duration-700"></div>

      {/* 2. Bagian Gambar Produk */}
      <div className="relative h-56 bg-slate-800/50 overflow-hidden">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Laptop className="w-16 h-16 text-slate-600" />
          </div>
        )}
        
        {/* Overlay Hover Ikon Mata */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <Eye className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* 3. Konten Teks & Informasi */}
      <div className="p-6">
        <div className="mb-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-yellow-500 font-bold">
            {product.category}
          </span>
          <h3 className="text-xl font-bold text-white mt-1 group-hover:text-yellow-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-slate-400">{product.brand}</p>
        </div>

        {/* Harga & Tombol WA */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Harga Terbaik</p>
            <p className="text-xl font-black text-white">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Tombol WA (Hanya Ikon Sesuai Request) */}
          {product.whatsapp && (
            <button
              onClick={handleWhatsAppClick}
              className="p-3 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-2xl border border-green-500/20 hover:border-green-400 transition-all duration-300 shadow-lg shadow-green-500/10"
              title="Hubungi Penjual"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Highlight Tipis Kuning Kunang-kunang di Bawah */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};

export default ProductCard;