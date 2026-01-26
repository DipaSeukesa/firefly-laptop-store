import React, { useState, useEffect } from 'react';
import { 
  X, DollarSign, Info, Battery, Keyboard, Monitor, 
  MessageCircle, ZoomIn, Cpu, HardDrive, Sparkles, Save,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  // ==========================================
  // BAGIAN 1: STATE MANAGEMENT (Logika Galeri & Zoom)
  // ==========================================
  const [activeImage, setActiveImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset index gambar saat modal dibuka untuk produk berbeda
  useEffect(() => {
    if (isOpen) setActiveImage(0);
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  // ==========================================
  // BAGIAN 2: HELPER FUNCTIONS (Format Harga & WA)
  // ==========================================
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleWhatsAppClick = () => {
    if (product.whatsapp) {
      const waNumber = product.whatsapp.replace(/[^0-9]/g, '');
      const message = encodeURIComponent(
        `Halo, saya tertarik dengan ${product.name}. Apakah stok masih ada?`
      );
      window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      
      {/* BAGIAN 3: MODAL CONTAINER (Dark Theme) */}
      <div
        className="bg-slate-900 border border-white/10 rounded-[2rem] shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto animate-fade-in-up scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-10 text-white">
          
          {/* BAGIAN 4: HEADER (Judul & Tombol Close) */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 leading-tight">
                {product.name}
              </h2>
              <p className="text-yellow-500 font-medium tracking-widest uppercase text-sm">{product.brand}</p>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* BAGIAN 5: GALERI GAMBAR (Sistem 5 Gambar) */}
            <div className="space-y-4">
              {/* Gambar Utama (Bisa Diklik Zoom) */}
              <div 
                className="relative aspect-video bg-slate-800 rounded-3xl overflow-hidden border border-white/5 cursor-zoom-in group"
                onClick={() => setIsZoomed(true)}
              >
                <img
                  src={product.images[activeImage] || product.link_gambar}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Thumbnails (Maksimal 5 Gambar) */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images && product.images.length > 0 ? (
                  product.images.slice(0, 5).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                        activeImage === idx ? 'border-yellow-500 scale-95' : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="thumb" />
                    </button>
                  ))
                ) : (
                   <p className="text-slate-500 text-xs italic">Tidak ada gambar tambahan</p>
                )}
              </div>
            </div>

            {/* BAGIAN 6: INFORMASI HARGA & SPEK */}
            <div className="space-y-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                <p className="text-slate-400 text-sm mb-1">Harga Penawaran</p>
                <div className="flex items-center gap-3 text-yellow-500">
                  <span className="text-4xl font-black">{formatPrice(product.price)}</span>
                </div>
                {product.condition && (
                  <span className="inline-block mt-3 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-lg text-xs font-bold border border-yellow-500/20">
                    Kondisi: {product.condition}
                  </span>
                )}
              </div>

              {/* Grid Spesifikasi Lengkap (7 Item) */}
<div className="grid grid-cols-2 gap-3 mb-6">
  {[
    { icon: <Cpu />, label: 'Processor', value: product.processor },
    { icon: <HardDrive />, label: 'RAM', value: product.ram },
    { icon: <Save />, label: 'Storage', value: product.storage },
    { icon: <Monitor />, label: 'Display', value: product.display },
    { icon: <Battery />, label: 'Battery', value: product.battery }, // Ambil dari laptop.battery_health
    { icon: <Sparkles />, label: 'Kondisi', value: product.condition_text }, // Ambil dari laptop.condition_physical
    { icon: <Info />, label: 'Fitur', value: product.features }, // Ambil dari laptop.features
  ].map((item, i) => (
    <div 
      key={i} 
      // Jika fitur unggulan (item terakhir), buat dia memanjang 2 kolom agar teksnya tidak terpotong
      className={`p-3 bg-white/5 border border-white/5 rounded-2xl ${item.label === 'Fitur' ? 'col-span-2' : ''}`}
    >
      <div className="flex items-center gap-2 mb-1 text-slate-400">
        {item.icon && React.cloneElement(item.icon, { size: 14, className: "text-indigo-400" })}
        <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
      </div>
      <p className="text-xs font-semibold text-white truncate">{item.value || '-'}</p>
    </div>
  ))}
</div>
            </div>
          </div>

          {/* BAGIAN 7: REKOMENDASI PENJUAL (HOOK) */}
<div className="mt-10">
  {product.hook &&(
    <div className="relative group">
      {/* Efek Glow Indigo */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-10"></div>
      
      <div className="relative p-8 bg-white/5 border border-white/10 rounded-3xl">
        <h3 className="text-indigo-400 font-bold text-xs uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
          <Sparkles size={16} /> Seller Review & Recommendation
        </h3>
        <p className="text-slate-200 text-lg leading-relaxed italic font-light">
          "{product.hook}"
        </p>
      </div>
    </div>
  )}
</div>

          {/* BAGIAN 8: FOOTER ACTIONS */}
          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row gap-4">
            {product.whatsapp && (
              <button
                onClick={handleWhatsAppClick}
                className="flex-[2] px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-3 text-lg"
              >
                <MessageCircle className="w-6 h-6" />
                Hubungi via WhatsApp
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* BAGIAN 9: LIGHTBOX ZOOM (DIPERBARUI) */}
{isZoomed && (
  <div 
    className="fixed inset-0 z-[100] bg-black backdrop-blur-md flex items-center justify-center p-4"
    onClick={() => setIsZoomed(false)} // Klik di area kosong untuk tutup zoom
  >
    {/* Container Gambar & Tombol agar tidak "tembus" klik-nya ke bawah */}
    <div className="relative max-w-5xl w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
      
      {/* Tombol Close Zoom */}
      <button 
        onClick={() => setIsZoomed(false)}
        className="absolute top-4 right-4 z-[110] text-white/70 hover:text-white p-2 bg-white/10 rounded-full transition-all"
      >
        <X size={32} />
      </button>

      {/* Tombol PREVIOUS */}
      {product.images?.length > 1 && (
        <button 
          onClick={() => setActiveImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
          className="absolute left-4 z-[110] p-4 bg-white/5 hover:bg-white/20 text-white rounded-full transition-all border border-white/10"
        >
          <ChevronLeft size={40} />
        </button>
      )}

      {/* GAMBAR UTAMA ZOOM */}
      <img 
        src={product.images[activeImage] || product.link_gambar} 
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-zoom-in select-none"
        alt="Fullsize View" 
      />

      {/* Tombol NEXT */}
      {product.images?.length > 1 && (
        <button 
          onClick={() => setActiveImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
          className="absolute right-4 z-[110] p-4 bg-white/5 hover:bg-white/20 text-white rounded-full transition-all border border-white/10"
        >
          <ChevronRight size={40} />
        </button>
      )}

      {/* Indikator Angka (Contoh: 1 / 5) */}
      <div className="absolute bottom-10 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium">
        {activeImage + 1} / {product.images.length}
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ProductDetailModal;