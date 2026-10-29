import React, { useState, useEffect, useMemo } from 'react';
import { X, Package, Layers, FileText, Check, Cpu, Loader2 } from 'lucide-react';
import { initSpeechRecognition, parseAssetWithGemini } from '../../lib/gemini';
import ModalVoiceAI from './modal/ModalVoiceAI';
import ModalDuplicateAlert from './modal/ModalDuplicateAlert';
import ModalPhotoSection from './modal/ModalPhotoSection';
import ModalSpecsEditor from './modal/ModalSpecsEditor';
import ModalLocationGenerator from './modal/ModalLocationGenerator';

/**
 * Modal Registrasi & Edit Aset Terpadu
 * Terdiri dari sub-komponen modular:
 * - ModalVoiceAI: VTT Speech recognition & Gemini AI Auto-Fill + Multi-Item Batch Panel
 * - ModalDuplicateAlert: Deteksi duplikasi seri L2/L3 & 1-click merge stok
 * - ModalPhotoSection: Upload Cloudinary & 1-click Google Images Search
 * - ModalSpecsEditor: Spesifikasi teknis dinamis (kolom JSONB)
 * - ModalLocationGenerator: Generator matriks alamat lab (Rak, Wadah, Cup, Makro)
 */
const AssetModal = ({ 
  isOpen, 
  onClose, 
  formData, 
  setFormData, 
  onSave, 
  onSaveBatch, 
  onIncrementStock, 
  existingAssets = [], 
  categoriesSuggest = [] 
}) => {
  if (!isOpen) return null;

  // --- STATE GENERATOR MATRIKS ALAMAT LAB ---
  const [selRak, setSelRak] = useState('');
  const [selWadah, setSelWadah] = useState('');
  const [selWadahNo, setSelWadahNo] = useState('');
  const [selCupType, setSelCupType] = useState('');
  const [selCupNo, setSelCupNo] = useState('');

  // --- STATE VOICE TO TEXT & AI ASSISTANT ---
  const [voiceInput, setVoiceInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState(null);
  const [speechRecognizer, setSpeechRecognizer] = useState(null);

  // --- STATE MULTI-ITEM BATCH ADDITION ---
  const [batchItems, setBatchItems] = useState([]);
  const [selectedBatchIdx, setSelectedBatchIdx] = useState(0);
  const [isSavingBatch, setIsSavingBatch] = useState(false);

  // --- STATE FOTO PRODUK (CLOUDINARY) ---
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Inisialisasi Speech Recognition
  useEffect(() => {
    const recognizer = initSpeechRecognition({
      onResult: (transcript) => {
        setVoiceInput(transcript);
      },
      onStatusChange: (status) => {
        setIsListening(status === 'LISTENING');
      },
      onError: (err) => {
        setAiMessage({ type: 'error', text: err });
      }
    });

    setSpeechRecognizer(recognizer);

    return () => {
      if (recognizer) {
        try { recognizer.stop(); } catch (e) { /* ignore */ }
      }
    };
  }, []);

  const toggleListening = () => {
    if (!speechRecognizer) {
      alert('Browser Anda tidak mendukung Speech Recognition. Silakan ketik langsung pada kotak input AI.');
      return;
    }

    if (isListening) {
      speechRecognizer.stop();
      setIsListening(false);
    } else {
      setAiMessage(null);
      try {
        speechRecognizer.start(voiceInput);
      } catch (err) {
        console.error('Failed to start speech:', err);
      }
    }
  };

  const applyItemToForm = (item) => {
    if (!item) return;

    if (item.lokasi_penyimpanan) {
      if (item.lokasi_penyimpanan.includes('RK1')) setSelRak('RK1');
      else if (item.lokasi_penyimpanan.includes('RK2')) setSelRak('RK2');
      else if (item.lokasi_penyimpanan.includes('RK3')) setSelRak('RK3');
    }

    setFormData(prev => {
      const mergedSpecs = {
        ...(prev.spesifikasi || {}),
        ...(item.spesifikasi || {})
      };

      const updated = {
        ...prev,
        nama_barang: item.nama_barang || prev.nama_barang,
        foto_url: item.foto_url || item.spesifikasi?.foto_url || '',
        kategori_layer: item.kategori_layer || prev.kategori_layer || 2,
        kategori_barang: item.kategori_barang || prev.kategori_barang || '',
        kondisi: item.kondisi || prev.kondisi || 'Bagus',
        status_barang: item.status_barang || prev.status_barang || 'Tersedia',
        qty: item.qty || prev.qty || 1,
        harga_modal: item.harga_modal !== undefined ? Number(item.harga_modal) : (prev.harga_modal || 0),
        harga_jual_target: item.harga_jual_target !== undefined ? Number(item.harga_jual_target) : (prev.harga_jual_target || 0),
        lokasi_penyimpanan: item.lokasi_penyimpanan || prev.lokasi_penyimpanan || '',
        kode_unit: item.kode_unit || prev.kode_unit || '',
        spesifikasi: mergedSpecs,
        catatan_teknis: item.catatan_teknis 
          ? (prev.catatan_teknis ? `${prev.catatan_teknis}\n${item.catatan_teknis}` : item.catatan_teknis)
          : prev.catatan_teknis
      };
      return updated;
    });
  };

  // Handler Proses AI Gemini
  const handleProcessAI = async () => {
    if (speechRecognizer && isListening) {
      speechRecognizer.stop();
      setIsListening(false);
    }

    const query = voiceInput.trim();
    if (!query) {
      setAiMessage({ type: 'error', text: 'Ketik nama barang atau gunakan mikrofon terlebih dahulu.' });
      return;
    }

    setAiLoading(true);
    const lineCount = (query.match(/\n/g) || []).length + 1;
    setAiMessage({ 
      type: 'info', 
      text: lineCount > 1 
        ? `Gemini sedang menganalisis ${lineCount} item & spesifikasi... Mohon tunggu sebentar.` 
        : 'Gemini sedang menganalisis item & spesifikasi...' 
    });

    try {
      const parsedData = await parseAssetWithGemini(query);
      const items = Array.isArray(parsedData.items) && parsedData.items.length > 0
        ? parsedData.items
        : [parsedData];

      if (items.length > 1) {
        setBatchItems(items);
        setSelectedBatchIdx(0);
        applyItemToForm(items[0]);
        setAiMessage({ 
          type: 'success', 
          text: `✨ Berhasil mendeteksi ${items.length} item sekaligus! Anda dapat meninjau form atau langsung klik "Simpan Semua".` 
        });
      } else {
        setBatchItems([]);
        const singleItem = items[0] || parsedData;
        applyItemToForm(singleItem);

        const modalFormatted = Number(singleItem.harga_modal || 0).toLocaleString('id-ID');
        const targetFormatted = Number(singleItem.harga_jual_target || 0).toLocaleString('id-ID');

        setAiMessage({ 
          type: 'success', 
          text: `✨ Berhasil! ${singleItem.nama_barang} (Modal: Rp ${modalFormatted} | Target: Rp ${targetFormatted}) telah dilengkapi.` 
        });
      }
    } catch (err) {
      setAiMessage({ type: 'error', text: `Gagal memproses AI: ${err.message}` });
    } finally {
      setAiLoading(false);
    }
  };

  // Handler Update Foto Real-Time ke formData dan batchItems
  const handleFotoChange = (url) => {
    const cleanUrl = url ? url.trim() : '';
    setFormData(prev => ({ ...prev, foto_url: cleanUrl }));

    if (batchItems.length > 0 && selectedBatchIdx >= 0) {
      setBatchItems(prev => prev.map((item, idx) => 
        idx === selectedBatchIdx 
          ? { 
              ...item, 
              foto_url: cleanUrl,
              spesifikasi: { ...(item.spesifikasi || {}), foto_url: cleanUrl }
            } 
          : item
      ));
    }
  };

  // Handler Terapkan Foto Ini ke Seluruh Produk dalam Batch
  const handleApplyPhotoToAllBatch = (url) => {
    const cleanUrl = url ? url.trim() : '';
    setFormData(prev => ({ ...prev, foto_url: cleanUrl }));

    if (batchItems.length > 0) {
      setBatchItems(prev => prev.map(item => ({
        ...item,
        foto_url: cleanUrl,
        spesifikasi: { ...(item.spesifikasi || {}), foto_url: cleanUrl }
      })));
    }
  };

  const handleSelectBatchItem = (item, nextIdx) => {
    // 1. Simpan perubahan item saat ini ke dalam batchItems sebelum pindah
    if (selectedBatchIdx >= 0 && selectedBatchIdx < batchItems.length) {
      setBatchItems(prev => prev.map((bItem, idx) => 
        idx === selectedBatchIdx ? { ...bItem, ...formData } : bItem
      ));
    }
    // 2. Pilih item baru dan terapkan ke form
    setSelectedBatchIdx(nextIdx);
    applyItemToForm(item);
  };

  const handleSaveAllBatch = async (customItems = null) => {
    const listToSave = Array.isArray(customItems) && customItems.length > 0 ? customItems : batchItems;
    if (!onSaveBatch || listToSave.length === 0) return;
    setIsSavingBatch(true);
    try {
      // Pastikan field foto_url bersih untuk semua item batch
      const cleanList = listToSave.map(item => ({
        ...item,
        foto_url: item.foto_url || item.spesifikasi?.foto_url || null
      }));
      const ok = await onSaveBatch(cleanList);
      if (ok) {
        setBatchItems([]);
      }
    } catch (err) {
      console.error('Error batch save:', err);
    } finally {
      setIsSavingBatch(false);
    }
  };

  // Handler Submit Form Pintar: Jika ada banyak item batch, simpan semua item sekaligus
  const handleFormSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (batchItems.length > 1) {
      // Sinkronkan data form yang mungkin diedit oleh teknisi ke dalam item aktif di batch
      const syncedBatch = batchItems.map((item, idx) => 
        idx === selectedBatchIdx ? { ...item, ...formData } : item
      );
      await handleSaveAllBatch(syncedBatch);
    } else {
      await onSave(e);
    }
  };

  // Deteksi Duplikasi Seri / Barang Serupa di Inventaris (Kecuali L1 Laptop Bekas)
  const duplicateMatch = useMemo(() => {
    if (!formData.nama_barang || formData.kategori_layer === 1) return null;

    const cleanInputName = formData.nama_barang.trim().toLowerCase();
    const cleanPartNo = (formData.spesifikasi?.part_number || '').trim().toLowerCase();

    return existingAssets.find(a => {
      if (a.kategori_layer === 1) return false;
      if (formData.id && a.id === formData.id) return false;

      const aName = (a.nama_barang || '').trim().toLowerCase();
      const aPartNo = (a.spesifikasi?.part_number || '').trim().toLowerCase();

      if (cleanPartNo && aPartNo && cleanPartNo === aPartNo) return true;
      if (cleanInputName && aName === cleanInputName) return true;

      return false;
    });
  }, [formData.nama_barang, formData.spesifikasi, formData.kategori_layer, formData.id, existingAssets]);

  // EFFECT 1: Generator Otomatis Alamat Fisik Penyimpanan
  useEffect(() => {
    let generatedAddress = '';
    if (selRak) generatedAddress += selRak;
    if (selWadah && selWadahNo) {
      generatedAddress += (generatedAddress ? '-' : '') + `${selWadah}${selWadahNo}`;
    }
    if (selCupType && selCupNo) {
      generatedAddress += (generatedAddress ? '-' : '') + `${selCupType}${selCupNo}`;
    }

    if (generatedAddress) {
      setFormData(prev => ({ ...prev, lokasi_penyimpanan: generatedAddress }));
    }
  }, [selRak, selWadah, selWadahNo, selCupType, selCupNo, setFormData]);

  // EFFECT 2: Automasi Kode Unit Berdasarkan Level Prioritas
  useEffect(() => {
    if (formData.kategori_layer === 1) {
      const laptopAssets = existingAssets.filter(asset =>
        asset.kode_unit && asset.kode_unit.startsWith('L-')
      );

      let maxNumber = 0;
      laptopAssets.forEach(asset => {
        const numPart = parseInt(asset.kode_unit.replace('L-', ''), 10);
        if (!isNaN(numPart) && numPart > maxNumber) {
          maxNumber = numPart;
        }
      });

      const nextNumber = maxNumber + 1;
      const nextCode = `L-${String(nextNumber).padStart(3, '0')}`;
      setFormData(prev => ({ ...prev, kode_unit: nextCode }));
    } else if (formData.kategori_layer === 2) {
      if (formData.lokasi_penyimpanan) {
        const alamatArray = formData.lokasi_penyimpanan.split('-');
        const alamatUjung = alamatArray[alamatArray.length - 1];
        setFormData(prev => ({ ...prev, kode_unit: `SN-${alamatUjung}` }));
      } else {
        setFormData(prev => ({ ...prev, kode_unit: 'SN-BELUM-LENGKAP' }));
      }
    } else if (formData.kategori_layer === 3) {
      setFormData(prev => ({ ...prev, kode_unit: '' }));
    }
  }, [formData.kategori_layer, formData.lokasi_penyimpanan, existingAssets, setFormData]);

  const resetMatrixLocation = () => {
    setSelRak('');
    setSelWadah('');
    setSelWadahNo('');
    setSelCupType('');
    setSelCupNo('');
    setFormData(prev => ({ ...prev, lokasi_penyimpanan: '', kode_unit: '' }));
  };

  // Kalkulasi Live Estimasi Keuntungan
  const qty = Number(formData.qty) || 1;
  const modal = Number(formData.harga_modal) || 0;
  const target = Number(formData.harga_jual_target) || 0;
  const totalModal = modal * qty;
  const totalTarget = target * qty;
  const profitMargin = totalTarget - totalModal;
  const profitPercent = totalModal > 0 ? Math.round((profitMargin / totalModal) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col">

        {/* HEADER MODAL */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Package size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                {formData.nama_barang ? 'Edit / Perbarui Aset' : 'Registrasi Aset Baru'}
              </h3>
              <p className="text-xs text-slate-400">
                Lengkapi identitas, spesifikasi teknis dinamis, dan lokasi lab
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM CONTENT (SCROLLABLE) */}
        <form onSubmit={handleFormSubmit} className="space-y-4 overflow-y-auto pr-1">

          {/* 1. ASISTEN SUARA VTT & GEMINI AI AUTO-FILL */}
          <ModalVoiceAI
            voiceInput={voiceInput}
            setVoiceInput={setVoiceInput}
            isListening={isListening}
            toggleListening={toggleListening}
            aiLoading={aiLoading}
            aiMessage={aiMessage}
            handleProcessAI={handleProcessAI}
            batchItems={batchItems}
            selectedBatchIdx={selectedBatchIdx}
            isSavingBatch={isSavingBatch}
            handleSelectBatchItem={handleSelectBatchItem}
            handleSaveAllBatch={handleSaveAllBatch}
          />

          {/* 2. DETEKSI DUPLIKASI SERI (KECUALI L1 LAPTOP) */}
          <ModalDuplicateAlert
            duplicateMatch={duplicateMatch}
            qty={formData.qty}
            onIncrementStock={onIncrementStock}
            onClose={onClose}
          />

          {/* 3. FOTO PRODUK ASET (CLOUDINARY, GOOGLE SEARCH & MULTI-ITEM BATCH MANAGER) */}
          <ModalPhotoSection
            fotoUrl={formData.foto_url}
            onFotoChange={handleFotoChange}
            namaBarang={formData.nama_barang}
            isUploadingPhoto={isUploadingPhoto}
            setIsUploadingPhoto={setIsUploadingPhoto}
            batchItems={batchItems}
            selectedBatchIdx={selectedBatchIdx}
            onSelectBatchIdx={(newIdx) => handleSelectBatchItem(batchItems[newIdx], newIdx)}
            onApplyPhotoToAllBatch={handleApplyPhotoToAllBatch}
          />

          {/* 4. NAMA BARANG */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              Nama Barang / Unit <span className="text-rose-500">*</span>
            </label>
            <input
              required
              placeholder="Contoh: Lenovo 90W AC Adapter (ADLX90NCC2A)"
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
              value={formData.nama_barang || ''}
              onChange={e => setFormData({ ...formData, nama_barang: e.target.value })}
            />
          </div>

          {/* 5. LEVEL PRIORITAS ASET */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Layers size={14} className="text-cyan-400" />
              Klasifikasi & Arus Perputaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 1, title: 'L1: Utama', desc: 'Laptop / Gadget', sub: 'Perputaran Cepat' },
                { id: 2, title: 'L2: Stok', desc: 'Sensor / Part', sub: 'Simpanan Lab' },
                { id: 3, title: 'L3: Tools', desc: 'Alat / Solder', sub: 'Alat Kerja' }
              ].map(level => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, kategori_layer: level.id })}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
                    formData.kategori_layer === level.id
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold">{level.title}</span>
                  <span className="text-[11px] text-slate-300 font-medium mt-0.5">{level.desc}</span>
                  <span className="text-[9px] text-slate-500 font-normal mt-0.5">{level.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 6. KATEGORI & KODE UNIT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Kategori Komponen
              </label>
              <input
                type="text"
                list="category-suggestions"
                value={formData.kategori_barang || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, kategori_barang: e.target.value }))}
                placeholder="Pilih atau ketik kategori..."
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
              />
              <datalist id="category-suggestions">
                {categoriesSuggest && categoriesSuggest.map((category, index) => (
                  <option key={index} value={category} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5 flex items-center gap-1">
                <Cpu size={12} className="text-cyan-400" />
                Kode Identitas Unit
              </label>
              <input
                key={`kode-unit-layer-${formData.kategori_layer || 1}`}
                placeholder={formData.kategori_layer === 3 ? "Tidak perlu kode (TOOLS)" : "Kode otomatis..."}
                readOnly={formData.kategori_layer === 1 || formData.kategori_layer === 2}
                className={`w-full p-3 rounded-xl border text-sm font-mono tracking-wider outline-none transition-colors ${
                  formData.kategori_layer === 3
                    ? 'bg-slate-950/40 border-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-950/80 border-slate-800 text-cyan-400 focus:border-cyan-500'
                }`}
                value={formData.kode_unit || ''}
                onChange={e => setFormData({ ...formData, kode_unit: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          {/* 7. SPESIFIKASI TEKNIS DINAMIS (JSONB) */}
          <ModalSpecsEditor
            spesifikasi={formData.spesifikasi || {}}
            onUpdateSpecs={(newSpecs) => setFormData(prev => ({ ...prev, spesifikasi: newSpecs }))}
          />

          {/* 8. KUANTITAS & FINANSIAL */}
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Jumlah (Qty) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.qty}
                  onChange={(e) => setFormData(prev => ({ ...prev, qty: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-sm text-white font-mono outline-none"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Modal / Unit (Rp)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-sm font-mono text-emerald-400 outline-none"
                  value={formData.harga_modal || ''}
                  onChange={e => setFormData({ ...formData, harga_modal: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Target Jual / Unit (Rp)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-sm font-mono text-cyan-400 outline-none"
                  value={formData.harga_jual_target || ''}
                  onChange={e => setFormData({ ...formData, harga_jual_target: e.target.value })}
                />
              </div>
            </div>

            {modal > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Total Modal ({qty} unit): <strong className="text-emerald-400">Rp {totalModal.toLocaleString('id-ID')}</strong></span>
                {target > 0 && (
                  <span className={`font-bold ${profitMargin >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                    Estimasi Margin: {profitMargin >= 0 ? `+Rp ${profitMargin.toLocaleString('id-ID')} (+${profitPercent}%)` : `-Rp ${Math.abs(profitMargin).toLocaleString('id-ID')}`}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 9. GENERATOR ALAMAT MATRIKS PENYIMPANAN */}
          <ModalLocationGenerator
            lokasiPenyimpanan={formData.lokasi_penyimpanan}
            onLocationChange={(val) => setFormData(prev => ({ ...prev, lokasi_penyimpanan: val }))}
            selRak={selRak}
            setSelRak={setSelRak}
            selWadah={selWadah}
            setSelWadah={setSelWadah}
            selWadahNo={selWadahNo}
            setSelWadahNo={setSelWadahNo}
            selCupType={selCupType}
            setSelCupType={setSelCupType}
            selCupNo={selCupNo}
            setSelCupNo={setSelCupNo}
            onResetLocation={resetMatrixLocation}
          />

          {/* 10. KONDISI & CATATAN TEKNIS */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              Kondisi Fisik Barang
            </label>
            <select
              value={formData.kondisi || 'Bagus'}
              onChange={e => setFormData({ ...formData, kondisi: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-cyan-500 mb-3"
            >
              <option value="Bagus">Bagus / Siap Pakai</option>
              <option value="Servis">Butuh Servis / Perbaikan</option>
              <option value="Part Rusak">Bekas / Part Rusak</option>
              <option value="Suku Cadang">Suku Cadang</option>
            </select>

            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <FileText size={13} className="text-cyan-400" />
              Catatan Teknis / Deskripsi Spesifikasi
            </label>
            <textarea
              placeholder="Tulis spesifikasi, kelengkapan, pin layout, nomor seri fisik..."
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-slate-300 min-h-[70px] outline-none transition-colors"
              value={formData.catatan_teknis || ''}
              onChange={e => setFormData({ ...formData, catatan_teknis: e.target.value })}
            />
          </div>

          {/* 11. SUBMIT BUTTON DENGAN DETEKSI BATCH OTOMATIS */}
          <div className="pt-2">
            {batchItems.length > 1 ? (
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isSavingBatch}
                  className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingBatch ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} strokeWidth={2.5} />
                  )}
                  <span>Simpan Semua ({batchItems.length}) Produk Sekaligus ke Gudang</span>
                </button>

                <button
                  type="button"
                  onClick={onSave}
                  className="w-full py-1 text-center text-[11px] text-slate-400 hover:text-white transition-colors"
                >
                  Atau hanya simpan 1 item ({formData.nama_barang ? `"${formData.nama_barang.slice(0, 25)}..."` : 'aktif'}) ini saja
                </button>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2"
              >
                <Check size={16} />
                <span>Simpan & Amankan ke Gudang</span>
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default AssetModal;