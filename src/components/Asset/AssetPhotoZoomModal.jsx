import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Camera, Search, ZoomIn, Package, MapPin } from 'lucide-react';
import { getGoogleImageSearchUrl } from '../../lib/cloudinary';

/**
 * Modal Lightbox Pembesar Foto Produk Aset (Teleported via createPortal ke document.body)
 * Fitur:
 * 1. Menampilkan foto produk resolusi tinggi dalam ukuran penuh (Full-Size Zoom)
 * 2. Latar belakang gelap dengan backdrop blur (z-[10000])
 * 3. Navigasi keyboard Escape untuk menutup
 * 4. Pintas langsung untuk ganti foto atau buka gambar asli di tab baru
 */
const AssetPhotoZoomModal = ({
  isOpen,
  onClose,
  asset,
  photoUrl,
  onOpenPhotoModal
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !photoUrl || !asset) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[10000] bg-slate-950/92 backdrop-blur-xl flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* HEADER ZOOM LIGHTBOX */}
      <div 
        className="w-full max-w-4xl mx-auto flex items-center justify-between pb-3 border-b border-slate-800/80 shrink-0 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <ZoomIn size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-base sm:text-lg truncate">
              {asset.nama_barang}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-400">
              {asset.kode_unit && (
                <span className="font-mono text-cyan-300 font-bold">
                  #{asset.kode_unit}
                </span>
              )}
              {asset.lokasi_penyimpanan && (
                <span className="flex items-center gap-1 font-mono text-slate-400">
                  <MapPin size={11} className="text-cyan-400" />
                  {asset.lokasi_penyimpanan}
                </span>
              )}
              {asset.kategori_barang && (
                <span className="text-slate-500">
                  • {asset.kategori_barang}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 shadow-lg cursor-pointer"
          title="Tutup (Esc)"
        >
          <X size={20} />
        </button>
      </div>

      {/* CONTAINER GAMBAR UTAMA BESAR */}
      <div 
        className="flex-1 flex items-center justify-center py-4 my-auto relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative group max-h-[75vh] max-w-full flex items-center justify-center">
          <img
            src={photoUrl}
            alt={asset.nama_barang}
            referrerPolicy="no-referrer"
            className="max-h-[74vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-2xl border border-slate-800/80 bg-slate-950/80 select-none animate-in zoom-in-95 duration-200"
          />
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div 
        className="w-full max-w-xl mx-auto flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-slate-800/80 shrink-0 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {onOpenPhotoModal && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPhotoModal();
            }}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-950/50 cursor-pointer active:scale-95"
          >
            <Camera size={14} />
            <span>Ganti / Kelola Foto</span>
          </button>
        )}

        <a
          href={photoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          title="Buka link foto asli di tab browser baru"
        >
          <ExternalLink size={14} />
          <span>Buka Resolusi Penuh</span>
        </a>

        <a
          href={getGoogleImageSearchUrl(asset.nama_barang)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          title="Cari gambar alternatif di Google Images"
        >
          <Search size={14} />
          <span>Cari Google</span>
        </a>

        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
        >
          Tutup (Esc)
        </button>
      </div>

    </div>,
    document.body
  );
};

export default AssetPhotoZoomModal;
