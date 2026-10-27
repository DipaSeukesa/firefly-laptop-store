import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Camera, Image as ImageIcon, Link as LinkIcon, Search, 
  ExternalLink, Trash2, Loader2, Check, Sparkles, AlertCircle, Copy,
  RefreshCw, Video, VideoOff
} from 'lucide-react';
import { uploadToCloudinary, getGoogleImageSearchUrl } from '../../lib/cloudinary';

/**
 * Modal Pemilihan Sumber Foto Produk (Teleported via createPortal ke document.body)
 * Fitur:
 * 1. Buka Kamera Langsung (Webcam Laptop / Kamera HP via HTML5 getUserMedia dengan Shutter Jepret)
 * 2. Upload dari File / Galeri Komputer atau HP
 * 3. Tombol Besar & Jelas "Cari di Google Images" (Buka Tab Baru Otomatis)
 * 4. Tempel Link Gambar (URL Internet) dengan tombol Paste Clipboard instan
 * 5. Full viewport backdrop-blur (z-[9999]) sehingga seluruh layar lain blur dan modal tidak tertutup komponen lain
 */
const AssetPhotoModal = ({ 
  isOpen, 
  onClose, 
  asset, 
  photoUrl, 
  onUpdatePhoto,
  renderSmartFallback 
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewError, setPreviewError] = useState(false);

  // State untuk Live Camera / Webcam
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' atau 'user'
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const fallbackCameraInputRef = useRef(null);

  // Matikan stream kamera saat modal ditutup atau unmount
  const stopCameraStream = (streamToStop = null) => {
    const s = streamToStop || cameraStream;
    if (s) {
      s.getTracks().forEach(track => {
        try { track.stop(); } catch (e) { console.warn(e); }
      });
    }
    setCameraStream(null);
    setIsCameraActive(false);
    setCameraError(null);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Hubungkan mediaStream ke videoRef saat kamera aktif
  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => {
        console.warn('Video play error:', err);
      });
    }
  }, [isCameraActive, cameraStream]);

  if (!isOpen || !asset) return null;

  // 1. AKTIFKAN KAMERA LANGSUNG (WEBCAM / HP)
  const handleStartCamera = async (facingMode = 'environment') => {
    setCameraError(null);
    setIsCameraActive(true);
    setProcessStatus('Menyiapkan kamera...');

    // Hentikan stream sebelumnya jika ada
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser ini tidak mendukung akses kamera langsung.');
      }

      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setCameraFacing(facingMode);
    } catch (err) {
      console.warn('Gagal membuka kamera langsung:', err);
      setCameraError(err.message || 'Izin kamera ditolak atau kamera tidak ditemukan.');
      // Opsi cadangan jika getUserMedia tidak diizinkan: buka input file capture
      if (fallbackCameraInputRef.current) {
        fallbackCameraInputRef.current.click();
      }
    } finally {
      setProcessStatus('');
    }
  };

  // Toggle Ganti Kamera Depan / Belakang
  const handleToggleFacingMode = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    handleStartCamera(nextFacing);
  };

  // JEPRET FOTO DARI KAMERA
  const handleCaptureSnapshot = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    setIsProcessing(true);
    setProcessStatus('Mengunggah hasil jepretan foto...');

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsProcessing(false);
        setProcessStatus('');
        alert('Gagal mengambil gambar dari kamera.');
        return;
      }

      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
      stopCameraStream();

      try {
        const { url } = await uploadToCloudinary(file);
        if (onUpdatePhoto) {
          await onUpdatePhoto(asset.id, url);
        }
        handleCloseModal();
      } catch (err) {
        console.error('Upload foto gagal:', err);
        alert(`Gagal mengunggah foto: ${err.message}`);
      } finally {
        setIsProcessing(false);
        setProcessStatus('');
      }
    }, 'image/jpeg', 0.92);
  };

  // 2. PILIH DARI FILE / GALERI
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessStatus('Mengunggah foto ke Cloudinary...');

    try {
      const { url } = await uploadToCloudinary(file);
      if (onUpdatePhoto) {
        await onUpdatePhoto(asset.id, url);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Upload foto gagal:', err);
      alert(`Gagal mengunggah foto: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
      e.target.value = '';
    }
  };

  // 3. SIMPAN LINK URL WEB MANUAL (TANPA RELOAD)
  const handleSaveUrl = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanUrl = (previewUrl || urlInput).trim();
    if (!cleanUrl) return;

    setIsProcessing(true);
    setProcessStatus('Menyimpan link gambar...');

    try {
      if (onUpdatePhoto) {
        await onUpdatePhoto(asset.id, cleanUrl);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Simpan link foto gagal:', err);
      alert(`Gagal menyimpan link foto: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  // Paste Cepat dari Clipboard
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().startsWith('http')) {
          setUrlInput(text.trim());
          setPreviewUrl(text.trim());
          setPreviewError(false);
        } else {
          alert('Clipboard tidak berisi URL gambar yang valid (harus diawali http:// atau https://).');
        }
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  // 4. HAPUS FOTO
  const handleRemovePhoto = async () => {
    if (window.confirm(`Hapus foto untuk "${asset.nama_barang}" dan gunakan Smart Hardware Badge?`)) {
      setIsProcessing(true);
      setProcessStatus('Menghapus foto...');
      try {
        if (onUpdatePhoto) {
          await onUpdatePhoto(asset.id, null);
        }
        handleCloseModal();
      } catch (err) {
        console.error('Hapus foto gagal:', err);
        alert(`Gagal menghapus foto: ${err.message}`);
      } finally {
        setIsProcessing(false);
        setProcessStatus('');
      }
    }
  };

  const handleCloseModal = () => {
    stopCameraStream();
    onClose();
  };

  // Menggunakan createPortal agar modal berada di document.body dan tidak terpotong stacking context card
  return createPortal(
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col overflow-y-auto selection:bg-cyan-500 selection:text-black"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Camera size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-base sm:text-lg leading-tight">
                Kelola Foto Produk
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-[260px] sm:max-w-[340px] mt-0.5">
                {asset.nama_barang}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            disabled={isProcessing}
            type="button"
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* LOADING OVERLAY */}
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3 rounded-3xl">
            <Loader2 size={36} className="animate-spin text-cyan-400" />
            <p className="text-sm font-semibold text-cyan-300">
              {processStatus || 'Memproses foto...'}
            </p>
          </div>
        )}

        {/* VIEW 1: TAMPILAN LIVE STREAM KAMERA (JIKA KAMERA AKTIF) */}
        {isCameraActive ? (
          <div className="space-y-3 mb-4">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border-2 border-cyan-500 shadow-xl shadow-cyan-950/40 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Status indicator live */}
              <div className="absolute top-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-700 text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>KAMERA LIVE</span>
              </div>

              {/* Tombol switch kamera depan/belakang */}
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/80 text-white border border-slate-700 hover:bg-slate-800 transition-colors shadow-md"
                title="Ganti Kamera Depan / Belakang"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {cameraError && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Tombol Shutter Jepret & Batal */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/50 active:scale-95 cursor-pointer"
              >
                <Camera size={16} />
                <span>Jepret Foto Sekarang</span>
              </button>

              <button
                type="button"
                onClick={stopCameraStream}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <VideoOff size={16} />
                <span>Tutup Kamera</span>
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: TAMPILAN PREVIEW GAMBAR SAAT INI */
          <div className="mb-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
            <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner">
              {previewUrl && !previewError ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={() => setPreviewError(true)}
                />
              ) : photoUrl ? (
                <img
                  src={photoUrl}
                  alt={asset.nama_barang}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                renderSmartFallback ? renderSmartFallback(asset) : (
                  <div className="text-[10px] text-slate-500 text-center font-bold">No Image</div>
                )
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Status Foto Saat Ini:
              </span>
              {previewUrl ? (
                previewError ? (
                  <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                    <AlertCircle size={13} /> Link tidak dapat dimuat
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                    <Sparkles size={13} /> Preview Link Baru
                  </span>
                )
              ) : photoUrl ? (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Check size={13} /> Foto Tersimpan Aktif
                </span>
              ) : (
                <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1">
                  <Sparkles size={13} /> Smart Graphic Badge
                </span>
              )}
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Pilih kamera langsung, file galeri, cari di Google Images, atau tempel link gambar di bawah.
              </p>
            </div>
          </div>
        )}

        {/* INPUT HIDDEN UNTUK FILE & FALLBACK KAMERA */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isProcessing}
        />
        <input
          ref={fallbackCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isProcessing}
        />

        {/* 3 PILIHAN UTAMA SUMBER FOTO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
          
          {/* PILIHAN 1: BUKA KAMERA LANGSUNG */}
          <button
            type="button"
            onClick={() => handleStartCamera('environment')}
            disabled={isProcessing}
            className="p-3 rounded-2xl bg-gradient-to-br from-cyan-600/20 to-cyan-500/10 hover:from-cyan-600/30 hover:to-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400 flex flex-col items-center text-center gap-2 transition-all active:scale-95 group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 group-hover:scale-110 transition-transform">
              <Camera size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Buka Kamera</span>
              <span className="text-[10px] text-slate-400">Webcam / Kamera HP</span>
            </div>
          </button>

          {/* PILIHAN 2: PILIH DARI FILE / GALERI */}
          <button
            type="button"
            onClick={handleFileSelect}
            disabled={isProcessing}
            className="p-3 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-500/10 hover:from-blue-600/30 hover:to-blue-500/20 border border-blue-500/30 hover:border-blue-400 flex flex-col items-center text-center gap-2 transition-all active:scale-95 group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 group-hover:scale-110 transition-transform">
              <ImageIcon size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Pilih File / Galeri</span>
              <span className="text-[10px] text-slate-400">Dari folder perangkat</span>
            </div>
          </button>

          {/* PILIHAN 3: CARI DI GOOGLE IMAGES (BESAR & JELAS) */}
          <a
            href={getGoogleImageSearchUrl(asset.nama_barang)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-gradient-to-br from-amber-600/20 to-amber-500/10 hover:from-amber-600/30 hover:to-amber-500/20 border border-amber-500/30 hover:border-amber-400 flex flex-col items-center text-center gap-2 transition-all active:scale-95 group cursor-pointer no-underline"
            title="Buka tab baru Google Images untuk menyalin link gambar"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 group-hover:scale-110 transition-transform flex items-center justify-center">
              <Search size={22} />
            </div>
            <div>
              <span className="text-xs font-bold text-white flex items-center justify-center gap-1">
                <span>Cari di Google</span>
                <ExternalLink size={12} className="text-amber-400" />
              </span>
              <span className="text-[10px] text-slate-400">Buka Tab Google Images</span>
            </div>
          </a>

        </div>

        {/* INPUT LINK GAMBAR DARI INTERNET */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 mb-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <LinkIcon size={14} className="text-cyan-400" />
              <span>Tempel Link Gambar (URL Web)</span>
            </span>
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline cursor-pointer"
              title="Tempel teks link dari clipboard"
            >
              <Copy size={12} /> Paste Link
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="url"
              placeholder="Paste URL gambar (https://...)..."
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setPreviewUrl(e.target.value.trim());
                setPreviewError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveUrl();
                }
              }}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
            <button
              type="button"
              onClick={handleSaveUrl}
              disabled={isProcessing || !urlInput.trim()}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-950/40 shrink-0 cursor-pointer active:scale-95"
            >
              Simpan Link
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            💡 <em>Tips: Klik tombol <strong>"Cari di Google"</strong> di atas, klik kanan gambar yang cocok &gt; <strong>"Salin alamat gambar"</strong>, lalu tekan tombol <strong>Paste Link</strong> di sini.</em>
          </p>
        </div>

        {/* PILIHAN HAPUS FOTO JIKA SUDAH ADA */}
        {photoUrl && (
          <button
            type="button"
            onClick={handleRemovePhoto}
            disabled={isProcessing}
            className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
          >
            <Trash2 size={13} />
            <span>Hapus Foto & Kembalikan ke Smart Badge</span>
          </button>
        )}

      </div>
    </div>,
    document.body
  );
};

export default AssetPhotoModal;
