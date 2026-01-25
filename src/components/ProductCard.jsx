import React from 'react';
import { Laptop, DollarSign, Info, MessageCircle } from 'lucide-react';

const ProductCard = ({ product, onViewDetails }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleWhatsAppClick = (e) => {
    e.stopPropagation();
    if (product.whatsapp) {
      const waNumber = product.whatsapp.replace(/[^0-9]/g, '');
      const message = encodeURIComponent(
        `Halo, saya tertarik dengan ${product.name} yang harganya ${formatPrice(product.price)}. Apakah stok masih ada?`
      );
      window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
    }
  };

  return (
    <div className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Laptop className="w-16 h-16 text-slate-400" />
          </div>
        )}
        {product.condition && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-xs font-medium text-slate-700">
            {product.condition}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="font-display text-xl font-bold text-slate-800 mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-slate-500">{product.brand}</p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="price-badge inline-block px-4 py-2 rounded-lg text-white font-bold text-lg">
            {formatPrice(product.price)}
          </div>
        </div>

        {/* Key Specs */}
        <div className="space-y-2 mb-4">
          <div className="spec-item flex items-center gap-2 text-sm text-slate-600 p-2 rounded-lg">
            <Info className="w-4 h-4 text-indigo-500" />
            <span className="font-medium">{product.processor}</span>
          </div>
          <div className="spec-item flex items-center gap-2 text-sm text-slate-600 p-2 rounded-lg">
            <Info className="w-4 h-4 text-indigo-500" />
            <span>{product.ram} • {product.storage}</span>
          </div>
          {product.display && (
            <div className="spec-item flex items-center gap-2 text-sm text-slate-600 p-2 rounded-lg">
              <Info className="w-4 h-4 text-indigo-500" />
              <span className="line-clamp-1">{product.display}</span>
            </div>
          )}
        </div>

        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium">
            {product.category}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {product.whatsapp && (
            <button
              onClick={handleWhatsAppClick}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Pesan via WA
            </button>
          )}
          <button
            onClick={() => onViewDetails(product)}
            className={`px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-105 ${product.whatsapp ? 'flex-1' : 'w-full'}`}
          >
            Lihat Detail
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
