import React from 'react';
import { X, DollarSign, Info, Battery, Keyboard, Monitor, MessageCircle } from 'lucide-react';

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

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
        `Halo, saya tertarik dengan ${product.name} yang harganya ${formatPrice(product.price)}. Apakah stok masih ada?`
      );
      window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90%] overflow-y-auto animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h2 className="text-3xl font-display font-bold text-slate-800 mb-2">
                {product.name}
              </h2>
              <p className="text-lg text-slate-600">{product.brand}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Images Gallery */}
          {product.images && product.images.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                {product.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative h-48 bg-slate-100 rounded-xl overflow-hidden">
                    <img
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
            <div className="flex items-center gap-2 text-white">
              <DollarSign className="w-6 h-6" />
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            </div>
            {product.condition && (
              <p className="text-white/90 text-sm mt-2">Kondisi: {product.condition}</p>
            )}
          </div>

          {/* Specifications */}
          <div className="mb-6">
            <h3 className="text-xl font-display font-bold text-slate-800 mb-4">Spesifikasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="spec-item p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium text-slate-700">Processor</span>
                </div>
                <p className="text-slate-600">{product.processor}</p>
              </div>
              
              <div className="spec-item p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium text-slate-700">RAM</span>
                </div>
                <p className="text-slate-600">{product.ram}</p>
              </div>
              
              <div className="spec-item p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium text-slate-700">Storage</span>
                </div>
                <p className="text-slate-600">{product.storage}</p>
              </div>
              
              {product.display && (
                <div className="spec-item p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="w-5 h-5 text-indigo-500" />
                    <span className="font-medium text-slate-700">Display</span>
                  </div>
                  <p className="text-slate-600">{product.display}</p>
                </div>
              )}
              
              {product.graphics && (
                <div className="spec-item p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-5 h-5 text-indigo-500" />
                    <span className="font-medium text-slate-700">Graphics</span>
                  </div>
                  <p className="text-slate-600">{product.graphics}</p>
                </div>
              )}
              
              {product.battery && (
                <div className="spec-item p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Battery className="w-5 h-5 text-indigo-500" />
                    <span className="font-medium text-slate-700">Battery</span>
                  </div>
                  <p className="text-slate-600">{product.battery}</p>
                </div>
              )}
              
              {product.keyboard && (
                <div className="spec-item p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Keyboard className="w-5 h-5 text-indigo-500" />
                    <span className="font-medium text-slate-700">Keyboard</span>
                  </div>
                  <p className="text-slate-600">{product.keyboard}</p>
                </div>
              )}
            </div>
          </div>

          {/* Other Features */}
          {product.otherFeatures && (
            <div className="mb-6">
              <h3 className="text-xl font-display font-bold text-slate-800 mb-3">Fitur Lainnya</h3>
              <p className="text-slate-600">{product.otherFeatures}</p>
            </div>
          )}

          {/* Summary */}
          {product.summary && (
            <div className="mb-6 p-4 bg-indigo-50 rounded-xl">
              <h3 className="text-lg font-display font-bold text-indigo-900 mb-2">Kesimpulan</h3>
              <p className="text-indigo-800">{product.summary}</p>
            </div>
          )}

          {/* Category and Actions */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium">
                {product.category}
              </span>
            </div>
            <div className="flex gap-3">
              {product.whatsapp && (
                <button
                  onClick={handleWhatsAppClick}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Pesan via WA
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
