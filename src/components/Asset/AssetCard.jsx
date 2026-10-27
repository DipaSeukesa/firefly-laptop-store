import React, { useState } from 'react';
import { 
  Trash2, Edit2, MapPin, Calendar, Clock, ChevronDown, ChevronUp, 
  Tag, AlertCircle, Camera, Upload, ExternalLink, Plus, Loader2, Package, Sparkles, Zap, Search, ZoomIn
} from 'lucide-react';
import { uploadToCloudinary, getGoogleImageSearchUrl } from '../../lib/cloudinary';
import AssetPhotoModal from './AssetPhotoModal';
import AssetPhotoZoomModal from './AssetPhotoZoomModal';

export const getAssetPhoto = (asset) => {
  if (asset.foto_url) return asset.foto_url;
  if (asset.spesifikasi?.foto_url) return asset.spesifikasi.foto_url;
  const match = asset.catatan_teknis?.match(/\[FOTO_URL\]:\s*(https?:\/\/[^\s\n]+)/);
  if (match) return match[1];
  return null;
};

const AssetCard = ({ 
  asset, age, onDelete, onUpdateStatus, onEditClick, locDetails, 
  onIncrementStock, onUpdatePhoto 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  const photoUrl = getAssetPhoto(asset);
  const qty = asset.qty || 1;
  const unitCost = Number(asset.harga_modal) || 0;
  const totalCost = unitCost * qty;
  const unitTarget = Number(asset.harga_jual_target) || 0;
  const totalTarget = unitTarget * qty;
  const totalMargin = totalTarget - totalCost;
  const marginPercent = totalCost > 0 ? Math.round((totalMargin / totalCost) * 100) : 0;

  // Reset img error if photoUrl changes
  React.useEffect(() => {
    setImgError(false);
  }, [photoUrl]);

  // Otomatis hapus link jika foto gagal dibuka (404/403/broken)
  const handleImageError = () => {
    setImgError(true);
    if (photoUrl && onUpdatePhoto) {
      console.warn(`🧹 [Assets] Foto tidak dapat dimuat untuk #${asset.id} (${photoUrl}). Otomatis menghapus link rusak dari database...`);
      onUpdatePhoto(asset.id, null);
    }
  };

  // Visual Graphic Badge Otomatis jika barang belum memiliki foto fisik
  const renderSmartFallback = (item) => {
    const specs = item.spesifikasi || {};
    const nama = (item.nama_barang || '').toLowerCase();
    
    // 1. Deteksi Brand
    let brand = specs.brand || '';
    if (!brand) {
      if (nama.includes('lenovo')) brand = 'Lenovo';
      else if (nama.includes('asus')) brand = 'Asus';
      else if (nama.includes('acer')) brand = 'Acer';
      else if (nama.includes('dell')) brand = 'Dell';
      else if (nama.includes('hp')) brand = 'HP';
      else if (nama.includes('toshiba')) brand = 'Toshiba';
      else if (nama.includes('delta')) brand = 'Delta';
      else if (nama.includes('lite on') || nama.includes('lite-on') || nama.includes('liteon')) brand = 'Lite-On';
      else if (nama.includes('chicony')) brand = 'Chicony';
      else brand = item.kategori_barang || 'Part';
    }

    // 2. Skema Warna Brand Hardware
    let theme = {
      bg: 'from-slate-900 to-slate-950',
      border: 'border-slate-800',
      brandText: 'text-slate-400',
      badge: 'bg-slate-800/80 text-slate-300 border-slate-700'
    };

    const b = brand.toLowerCase();
    if (b.includes('lenovo')) {
      theme = { bg: 'from-rose-950/80 via-slate-950 to-slate-950', border: 'border-rose-500/40', brandText: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    } else if (b.includes('asus')) {
      theme = { bg: 'from-cyan-950/80 via-slate-950 to-slate-950', border: 'border-cyan-500/40', brandText: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
    } else if (b.includes('acer')) {
      theme = { bg: 'from-emerald-950/80 via-slate-950 to-slate-950', border: 'border-emerald-500/40', brandText: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    } else if (b.includes('dell')) {
      theme = { bg: 'from-blue-950/80 via-slate-950 to-slate-950', border: 'border-blue-500/40', brandText: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    } else if (b.includes('toshiba')) {
      theme = { bg: 'from-amber-950/80 via-slate-950 to-slate-950', border: 'border-amber-500/40', brandText: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    } else if (b.includes('hp')) {
      theme = { bg: 'from-slate-800/90 via-slate-950 to-slate-950', border: 'border-slate-600', brandText: 'text-slate-200', badge: 'bg-slate-700/60 text-slate-200 border-slate-600' };
    } else {
      theme = { bg: 'from-indigo-950/80 via-slate-950 to-slate-950', border: 'border-indigo-500/40', brandText: 'text-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
    }

    // 3. Daya (Watt)
    let daya = specs.daya || '';
    if (!daya) {
      const dMatch = nama.match(/(\d{2,3})\s*w/i);
      if (dMatch) daya = `${dMatch[1]}W`;
    }

    // 4. Sub-Spesifikasi (Voltase / Ampere)
    const volt = specs.output_voltase || '';
    const amp = specs.output_ampere || '';
    const specSub = volt && amp ? `${volt} • ${amp}` : (volt || amp || (specs.part_number || ''));

    // 5. Tipe Colokan Jack
    let jack = specs.tipe_jack || '';
    if (jack.length > 15) {
      if (jack.toLowerCase().includes('slim tip')) jack = 'Slim Tip';
      else if (jack.includes('5.5') && jack.includes('2.5')) jack = '5.5x2.5';
      else if (jack.includes('5.5') && jack.includes('1.7')) jack = '5.5x1.7 (Biru)';
      else if (jack.includes('4.5') && jack.includes('3.0')) jack = '4.5x3.0 (Pin)';
      else if (jack.toLowerCase().includes('type-c') || jack.toLowerCase().includes('usb-c')) jack = 'Type-C';
      else jack = jack.slice(0, 13) + '..';
    }

    return (
      <div className={`w-full h-full bg-gradient-to-br ${theme.bg} p-1.5 flex flex-col justify-between items-center text-center select-none relative overflow-hidden`}>
        {/* Brand Header */}
        <div className="w-full flex items-center justify-between px-0.5">
          <span className={`text-[9px] font-black tracking-wider uppercase truncate ${theme.brandText}`}>
            {brand.slice(0, 9)}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        </div>

        {/* Center Wattage / Power Badge */}
        <div className="my-auto py-0.5">
          {daya ? (
            <span className="font-mono text-base sm:text-lg font-black text-white tracking-tighter drop-shadow-md block">
              {daya}
            </span>
          ) : (
            <Zap size={18} className={`${theme.brandText} mx-auto`} />
          )}
          {specSub && (
            <span className="block text-[8px] font-mono text-slate-300 font-bold leading-tight truncate max-w-[80px]">
              {specSub}
            </span>
          )}
        </div>

        {/* Footer Jack Type */}
        <div className="w-full">
          <span className={`block text-[8px] font-mono px-1 py-0.5 rounded border truncate ${theme.badge}`}>
            {jack || 'DC Jack'}
          </span>
        </div>
      </div>
    );
  };

  // Status styling colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Tersedia':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Servis':
        return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
      case 'Terjual':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'Dipakai':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Habis':
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  // Layer styling
  const getLayerBadge = (layer) => {
    switch (layer) {
      case 1:
        return {
          label: 'L1: Laptop',
          style: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
        };
      case 2:
        return {
          label: 'L2: Komponen',
          style: 'bg-blue-500/15 text-blue-300 border-blue-500/30'
        };
      case 3:
      default:
        return {
          label: 'L3: Tools',
          style: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
        };
    }
  };

  const layerInfo = getLayerBadge(asset.kategori_layer);



  return (
    <div className="bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-3 sm:p-4 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-950/20 group flex flex-col justify-between backdrop-blur-sm">
      
      {/* ROW UTAMA: THUMBNAIL GAMBAR + KONTEN DETAIL + AKSI CEPAT */}
      <div className="flex items-start gap-3 sm:gap-4">
        
        {/* 1. THUMBNAIL GAMBAR ASET DENGAN FITUR KLIK UNTUK PERBESAR (LIGHTBOX) */}
        <div 
          onClick={() => {
            if (photoUrl && !imgError) {
              setShowZoomModal(true);
            } else {
              setShowPhotoModal(true);
            }
          }}
          className={`relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 group/img flex items-center justify-center shadow-inner ${
            photoUrl && !imgError ? 'cursor-zoom-in' : 'cursor-pointer'
          }`}
          title={photoUrl && !imgError ? "Klik untuk perbesar foto produk" : "Klik untuk tambah foto (Kamera / File / Link)"}
        >
          {photoUrl && !imgError ? (
            <img
              src={photoUrl}
              alt={asset.nama_barang}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
              onError={handleImageError}
            />
          ) : (
            renderSmartFallback(asset)
          )}

          {/* Tombol Aksi Cepat di Sudut Thumbnail (Selalu Terlihat & Touch-Friendly) */}
          <div className="absolute bottom-1 right-1 flex items-center gap-1 z-10">
            {photoUrl && !imgError && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowZoomModal(true);
                }}
                className="p-1 rounded-md bg-slate-900/95 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-slate-700/80 shadow-md transition-all active:scale-95"
                title="Perbesar Foto (Zoom)"
              >
                <ZoomIn size={11} />
              </button>
            )}
            <a
              href={getGoogleImageSearchUrl(asset.nama_barang)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-md bg-slate-900/95 hover:bg-amber-600 text-amber-300 hover:text-white border border-slate-700/80 shadow-md transition-all active:scale-95"
              title="Cari foto di Google Images"
            >
              <Search size={11} />
            </a>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPhotoModal(true);
              }}
              className="p-1 rounded-md bg-slate-900/95 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-slate-700/80 shadow-md transition-all active:scale-95"
              title="Kelola Foto Produk (Kamera / File / Link)"
            >
              <Camera size={11} />
            </button>
          </div>

          {/* Hover Overlay Hint di Desktop */}
          <div className="absolute inset-0 bg-slate-950/85 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1 z-10 text-[9px] font-bold">
            {photoUrl && !imgError ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowZoomModal(true);
                  }}
                  className="px-2 py-0.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <ZoomIn size={10} />
                  <span>Perbesar</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPhotoModal(true);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center gap-1 border border-slate-700 transition-transform active:scale-95 cursor-pointer"
                >
                  <Camera size={10} />
                  <span>Ganti</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPhotoModal(true);
                }}
                className="px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <Camera size={11} />
                <span>Pilih Foto</span>
              </button>
            )}
            <a
              href={getGoogleImageSearchUrl(asset.nama_barang)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[9px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 underline mt-0.5"
              title="Cari gambar di Google Images"
            >
              <Search size={9} />
              <span>Google</span>
            </a>
          </div>
        </div>

        {/* 2. KONTEN DETAIL LIST */}
        <div className="flex-1 min-w-0">
          
          {/* Baris 1: Badges Row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${layerInfo.style}`}>
              {layerInfo.label}
            </span>

            {locDetails && (
              <span className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-wider uppercase bg-gradient-to-r ${locDetails.color}`}>
                <MapPin size={9} className="shrink-0" />
                <span>{locDetails.label}</span>
              </span>
            )}

            {/* Qty Badge dengan Tombol +1 Cepat untuk L2 & L3 */}
            <div className="inline-flex items-center gap-1 bg-cyan-950/50 border border-cyan-800/50 px-2 py-0.5 rounded-md text-[10px] font-bold text-cyan-300 font-mono">
              <span>{qty} {qty > 1 ? 'Pcs' : 'Unit'}</span>
              {asset.kategori_layer !== 1 && onIncrementStock && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onIncrementStock(asset.id, 1); }}
                  className="p-0.5 hover:bg-cyan-500/20 rounded text-cyan-400 hover:text-white transition-colors"
                  title="Tambah 1 Stok Seri Ini"
                >
                  <Plus size={10} strokeWidth={3} />
                </button>
              )}
            </div>

            {/* Status Dropdown Compact */}
            <select
              value={asset.status_barang}
              onChange={(e) => onUpdateStatus(asset.id, e.target.value)}
              className={`border rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer ${getStatusColor(asset.status_barang)}`}
            >
              <option value="Tersedia" className="bg-slate-900 text-emerald-400">Tersedia</option>
              <option value="Terjual" className="bg-slate-900 text-purple-400">Terjual</option>
              <option value="Dipakai" className="bg-slate-900 text-blue-400">Dipakai</option>
              <option value="Servis" className="bg-slate-900 text-rose-400">Servis</option>
              <option value="Habis" className="bg-slate-900 text-slate-400">Habis</option>
            </select>

            {/* Peringatan Stok Lama */}
            {age > 30 && asset.status_barang === 'Tersedia' && (
              <span className="flex items-center gap-0.5 text-[9px] bg-rose-500/15 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded font-bold">
                <Clock size={9} /> {age}h
              </span>
            )}
          </div>

          {/* Baris 2: Nama Barang & Kategori */}
          <div className="mb-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors leading-tight truncate">
              {asset.nama_barang}
            </h3>
            {asset.kategori_barang && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                <Tag size={10} className="text-slate-500" />
                <span>{asset.kategori_barang}</span>
              </span>
            )}
          </div>

          {/* Baris 3: Spesifikasi Chips Inline (Maks 3 chip penting agar rapi) */}
          {asset.spesifikasi && Object.keys(asset.spesifikasi).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {Object.entries(asset.spesifikasi).slice(0, 3).map(([key, val]) => {
                if (!val || typeof val === 'object') return null;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300"
                  >
                    <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                    <strong className="text-cyan-300 font-medium">{String(val)}</strong>
                  </span>
                );
              })}
            </div>
          )}

          {/* Baris 4: Finansial Inline Ringkas */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono">
            <span className="text-slate-400">
              Modal: <strong className="text-emerald-400">Rp {totalCost.toLocaleString('id-ID')}</strong>
              {qty > 1 && <span className="text-[10px] text-slate-500 font-normal"> (@{unitCost.toLocaleString('id-ID')})</span>}
            </span>
            {unitTarget > 0 && (
              <span className="text-slate-400">
                Jual: <strong className="text-cyan-400">Rp {totalTarget.toLocaleString('id-ID')}</strong>
                <span className={`ml-1 text-[10px] font-bold ${totalMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ({totalMargin >= 0 ? `+${marginPercent}%` : `${marginPercent}%`})
                </span>
              </span>
            )}
          </div>

        </div>

        {/* 3. TOMBOL AKSI CEPAT DI KANAN */}
        <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEditClick(asset)}
              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors border border-transparent hover:border-cyan-500/20"
              title="Edit Data Aset"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(asset.id)}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
              title="Hapus Aset"
            >
              <Trash2 size={13} />
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] sm:text-[11px] font-semibold text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 py-1 px-1.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700"
          >
            <span>{isExpanded ? 'Tutup' : 'Detail'}</span>
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

      </div>

      {/* 4. EXPANDABLE DRAWER: SPEK LENGKAP, CATATAN, & KELOLA FOTO CLOUDINARY */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-dashed border-slate-800 animate-in fade-in duration-200 space-y-2.5">
          
          {/* Fitur Kelola Foto / Cloudinary & Cari Gambar Web */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <Camera size={12} /> Kelola Foto Produk:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
                >
                  <Camera size={11} />
                  <span>Kamera / File / Link</span>
                </button>

                <a
                  href={getGoogleImageSearchUrl(asset.nama_barang)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-colors"
                  title="Cari gambar di Google Images"
                >
                  <Search size={11} />
                  <span>Cari di Google Images</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>

          {/* Spesifikasi JSON Lengkap */}
          {asset.spesifikasi && Object.keys(asset.spesifikasi).length > 0 && (
            <div className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1">
                <Sparkles size={11} className="text-cyan-400" />
                <span>Detail Spesifikasi Teknis:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-xs">
                {Object.entries(asset.spesifikasi).map(([key, val]) => (
                  <div key={key} className="flex justify-between border-b border-slate-900 pb-0.5">
                    <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-white font-medium text-right ml-2">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Catatan Teknis / Deskripsi */}
          <div className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800 leading-relaxed font-sans">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
              <AlertCircle size={11} className="text-cyan-500" />
              Catatan Teknis / Deskripsi:
            </div>
            <p className="whitespace-pre-wrap">
              {asset.catatan_teknis || 'Tidak ada catatan teknis khusus untuk aset ini.'}
            </p>
          </div>

        </div>
      )}

      {/* MODAL PILIHAN SUMBER FOTO (KAMERA / FILE / LINK) */}
      {showPhotoModal && (
        <AssetPhotoModal
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          asset={asset}
          photoUrl={photoUrl && !imgError ? photoUrl : null}
          onUpdatePhoto={onUpdatePhoto}
          renderSmartFallback={renderSmartFallback}
        />
      )}

      {/* MODAL LIGHTBOX PEMBESAR FOTO PRODUK */}
      {showZoomModal && (
        <AssetPhotoZoomModal
          isOpen={showZoomModal}
          onClose={() => setShowZoomModal(false)}
          asset={asset}
          photoUrl={photoUrl && !imgError ? photoUrl : null}
          onOpenPhotoModal={() => setShowPhotoModal(true)}
        />
      )}

    </div>
  );
};

export default AssetCard;