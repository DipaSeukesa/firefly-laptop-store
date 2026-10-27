import React, { useState } from 'react';
import { 
  Camera, Upload, ExternalLink, Loader2, Check, Copy, Sparkles, 
  ChevronLeft, ChevronRight, Image as ImageIcon, Trash2 
} from 'lucide-react';
import { uploadToCloudinary, getGoogleImageSearchUrl } from '../../../lib/cloudinary';

/**
 * Komponen Manajemen Foto Aset (Single Item & Multi-Item Batch)
 * Fitur:
 * 1. Upload foto lokal ke Cloudinary
 * 2. Tempel URL foto internet langsung
 * 3. Navigasi foto per produk saat generate batch multi-item
 * 4. 1-Klik "Terapkan Foto Ini ke Semua Item Batch"
 * 5. Indikator kelengkapan foto batch
 */
const ModalPhotoSection = ({ 
  fotoUrl, 
  onFotoChange, 
  namaBarang = '', 
  isUploadingPhoto, 
  setIsUploadingPhoto,
  batchItems = [],
  selectedBatchIdx = 0,
  onSelectBatchIdx,
  onApplyPhotoToAllBatch
}) => {
  const [tempUrl, setTempUrl] = useState('');

  const isBatchMode = Array.isArray(batchItems) && batchItems.length > 1;
  const totalBatch = batchItems.length;
  const itemsWithPhotoCount = isBatchMode 
    ? batchItems.filter(item => item.foto_url && item.foto_url.trim() !== '').length 
    : (fotoUrl ? 1 : 0);

  // Upload file lokal atau foto kamera ke Cloudinary
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (setIsUploadingPhoto) setIsUploadingPhoto(true);
    try {
      const { url } = await uploadToCloudinary(file);
      onFotoChange(url);
    } catch (err) {
      alert(`Gagal upload foto ke Cloudinary: ${err.message}`);
    } finally {
      if (setIsUploadingPhoto) setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // Upload atau gunakan URL gambar dari internet
  const handleApplyRemoteUrl = async () => {
    const cleanUrl = tempUrl.trim();
    if (!cleanUrl) return;

    if (setIsUploadingPhoto) setIsUploadingPhoto(true);
    try {
      const { url } = await uploadToCloudinary(cleanUrl);
      onFotoChange(url);
      setTempUrl('');
    } catch (err) {
      console.warn('Fallback direct image URL:', err.message);
      onFotoChange(cleanUrl);
      setTempUrl('');
    } finally {
      if (setIsUploadingPhoto) setIsUploadingPhoto(false);
    }
  };

  // Paste cepat dari clipboard
  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().startsWith('http')) {
          setTempUrl(text.trim());
        } else {
          alert('Clipboard tidak berisi URL yang valid (harus diawali http:// atau https://).');
        }
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  return (
    <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
      
      {/* HEADER: TITLE + BATCH NAVIGATION JIKA MULTI-ITEM */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Camera size={14} className="text-cyan-400" />
            <span>Foto Produk {isBatchMode ? `(${selectedBatchIdx + 1}/${totalBatch})` : ''}</span>
          </label>
          {isBatchMode && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
              {itemsWithPhotoCount} / {totalBatch} berfoto
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {namaBarang && (
            <a
              href={getGoogleImageSearchUrl(namaBarang)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold underline"
              title={`Cari gambar untuk "${namaBarang}" di Google Images`}
            >
              <ExternalLink size={11} />
              <span>Cari di Google</span>
            </a>
          )}

          {/* Navigasi Cepat Item Batch Sebelumnya & Selanjutnya */}
          {isBatchMode && onSelectBatchIdx && (
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => onSelectBatchIdx(Math.max(0, selectedBatchIdx - 1))}
                disabled={selectedBatchIdx === 0}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                title="Pilih item sebelumnya"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] font-mono text-slate-300 px-1 font-bold">
                {selectedBatchIdx + 1}
              </span>
              <button
                type="button"
                onClick={() => onSelectBatchIdx(Math.min(totalBatch - 1, selectedBatchIdx + 1))}
                disabled={selectedBatchIdx === totalBatch - 1}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                title="Pilih item berikutnya"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STRIP MINI DAFTAR PRODUK BATCH (KLIK UNTUK PINDAH DAN ISI FOTO) */}
      {isBatchMode && onSelectBatchIdx && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Pilih produk untuk diisi fotonya:</span>
            <span className="text-cyan-400 font-semibold truncate max-w-[200px]">
              {selectedBatchIdx + 1}. {namaBarang || 'Item Aktif'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {batchItems.map((bItem, idx) => {
              const isSelected = selectedBatchIdx === idx;
              const hasPhoto = Boolean(bItem.foto_url && bItem.foto_url.trim() !== '');

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectBatchIdx(idx)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400 shadow-md shadow-cyan-950/40'
                      : hasPhoto
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                  title={`${idx + 1}. ${bItem.nama_barang} ${hasPhoto ? '(Sudah ada foto)' : '(Belum ada foto)'}`}
                >
                  <span>#{idx + 1}</span>
                  {hasPhoto ? (
                    <Check size={10} className={isSelected ? 'text-slate-950' : 'text-emerald-400'} />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* AREA UTAMA: PREVIEW & INPUT FOTO ITEM AKTIF */}
      <div className="flex items-center gap-3">
        {/* Preview Thumbnail */}
        <div className="relative w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt="Preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera size={22} className="text-slate-600" />
          )}
          {isUploadingPhoto && (
            <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center">
              <Loader2 size={18} className="animate-spin text-cyan-400" />
            </div>
          )}
        </div>

        {/* Action Buttons & Input URL */}
        <div className="flex-1 min-w-0 space-y-2">
          
          <div className="flex flex-wrap items-center gap-2">
            <label className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-cyan-950/30 active:scale-95">
              <Upload size={13} />
              <span>Upload File / Kamera</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploadingPhoto}
              />
            </label>

            {fotoUrl && (
              <button
                type="button"
                onClick={() => onFotoChange('')}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-500/40 text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={12} />
                <span>Hapus</span>
              </button>
            )}

            {/* Tombol Terapkan Foto Ini ke Semua Item Batch */}
            {isBatchMode && fotoUrl && onApplyPhotoToAllBatch && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Terapkan foto ini ke SEMUA (${totalBatch}) produk dalam batch sekaligus?`)) {
                    onApplyPhotoToAllBatch(fotoUrl);
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer active:scale-95"
                title="Terapkan link foto ini ke semua produk dalam batch yang sama"
              >
                <Sparkles size={12} className="text-indigo-400" />
                <span>Terapkan ke Semua ({totalBatch}) Item</span>
              </button>
            )}
          </div>

          {/* Baris Input Link URL Internet */}
          <div className="flex items-center gap-1.5">
            <input
              type="url"
              placeholder="Tempel link URL gambar (https://...)..."
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyRemoteUrl();
                }
              }}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Paste link dari clipboard"
            >
              <Copy size={12} />
            </button>
            <button
              type="button"
              onClick={handleApplyRemoteUrl}
              disabled={isUploadingPhoto || !tempUrl.trim()}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-all shrink-0 disabled:opacity-50 cursor-pointer active:scale-95"
            >
              Simpan
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ModalPhotoSection;
