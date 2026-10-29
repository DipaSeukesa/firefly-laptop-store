import React, { useRef, useEffect } from 'react';
import { Sparkles, Mic, MicOff, Loader2, Zap, AlertCircle, Layers, Check } from 'lucide-react';

/**
 * Komponen Voice to Text & Auto-Fill AI dengan Textarea Auto-Resize
 */
const ModalVoiceAI = ({
  voiceInput,
  setVoiceInput,
  isListening,
  toggleListening,
  aiLoading,
  aiMessage,
  handleProcessAI,
  batchItems = [],
  selectedBatchIdx = 0,
  isSavingBatch = false,
  handleSelectBatchItem,
  handleSaveAllBatch
}) => {
  const textareaRef = useRef(null);

  // Deteksi perangkat mobile/Android: di HP pengguna sudah memiliki mic bawaan keyboard (Gboard / Samsung Keyboard)
  const isMobileDevice = typeof navigator !== 'undefined' && (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

  // Auto-resize textarea mengikuti panjang teks dan baris baru (Enter)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      // Batasi min-height 52px dan max-height 220px agar tetap rapi
      textareaRef.current.style.height = `${Math.min(Math.max(scrollH, 52), 220)}px`;
    }
  }, [voiceInput]);

  const handleInputChange = (e) => {
    setVoiceInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    // Jika Ctrl + Enter atau Cmd + Enter ditekan, langsung jalankan Proses AI
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleProcessAI();
    }
  };

  return (
    <div className="space-y-3">
      {/* Box Asisten Suara & Gemini AI */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-950/80 to-slate-900 border border-cyan-500/30 shadow-lg shadow-cyan-950/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles size={14} className="text-cyan-400" />
            {isMobileDevice ? 'Auto-Fill Gemini AI' : 'Asisten Suara & Auto-Fill Gemini AI'}
          </span>
          <span className="text-[10px] font-mono text-cyan-400/90 font-bold bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
            {isMobileDevice ? 'Multi-Item Batch' : 'Continuous Mic + Multi-Item'}
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-2 leading-relaxed">
          {isMobileDevice
            ? 'Ketik nama barang atau gunakan ikon mikrofon pada keyboard HP (Gboard) untuk bicara.'
            : 'Bicara atau ketik satu / beberapa item sekaligus (tekan Enter untuk baris baru, Ctrl+Enter untuk proses).'}
        </p>

        <div className="flex items-start gap-2">
          {/* Tombol Mikrofon VTT (Hanya tampil di Laptop / Desktop Windows / Mac, disembunyikan di HP) */}
          {!isMobileDevice && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl border flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse ring-2 ring-rose-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-cyan-400'
              }`}
              title={isListening ? "Klik untuk menghentikan mikrofon" : "Klik & bicara nama barang"}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          {/* Textarea Auto-Height Dinamis */}
          <textarea
            ref={textareaRef}
            rows={2}
            placeholder={
              isMobileDevice
                ? "Contoh:\ntambahkan adaptor acer adp-65 jhbb dan toshiba sadp-75PBB pada rak 2"
                : (isListening
                    ? "Mendengarkan ucapan... (Jeda bicara tidak memutus mic. Tekan stop jika selesai)"
                    : "Contoh:\ntambahkan adaptor acer adp-65 jhbb dan toshiba sadp-75PBB pada rak 2")
            }
            value={voiceInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none resize-none leading-relaxed transition-all"
            style={{ minHeight: '52px' }}
          />

          {/* Tombol Eksekusi Gemini AI */}
          <button
            type="button"
            onClick={handleProcessAI}
            disabled={aiLoading}
            className="px-3.5 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-cyan-950/40 mt-0.5"
            title="Proses AI (atau tekan Ctrl+Enter)"
          >
            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            <span className="hidden sm:inline">Proses AI</span>
          </button>
        </div>

        {/* Notifikasi Status AI */}
        {aiMessage && (
          <div className={`mt-2 p-2 rounded-lg text-xs leading-relaxed flex items-center gap-1.5 ${
            aiMessage.type === 'error' 
              ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
              : aiMessage.type === 'success'
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                : 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/30'
          }`}>
            {aiMessage.type === 'error' ? <AlertCircle size={13} className="shrink-0" /> : <Sparkles size={13} className="shrink-0" />}
            <span>{aiMessage.text}</span>
          </div>
        )}
      </div>

      {/* === PANEL BATCH MULTI-ITEM (JIKA DETEKSI > 1 ITEM) === */}
      {batchItems.length > 1 && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 shadow-lg shadow-indigo-950/30 space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <Layers size={15} className="text-indigo-400" />
              <span>Daftar {batchItems.length} Item Terdeteksi Sekaligus</span>
            </div>
            <button
              type="button"
              onClick={handleSaveAllBatch}
              disabled={isSavingBatch}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/40 active:scale-95"
            >
              {isSavingBatch ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              <span>Simpan Semua ({batchItems.length}) Sekaligus</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {batchItems.map((item, idx) => {
              const isSelected = selectedBatchIdx === idx;
              const modalVal = Number(item.harga_modal || 0);
              const jualVal = Number(item.harga_jual_target || 0);
              const marginVal = jualVal - modalVal;
              const marginPct = modalVal > 0 ? Math.round((marginVal / modalVal) * 100) : 0;

              return (
                <div
                  key={idx}
                  onClick={() => handleSelectBatchItem && handleSelectBatchItem(item, idx)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-900/50 border-indigo-400 ring-2 ring-indigo-500/30'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-1.5">
                    {item.foto_url && (
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-950 border border-indigo-500/30 shrink-0 shadow-sm">
                        <img 
                          src={item.foto_url} 
                          alt="" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.style.display = 'none'; }} 
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-xs font-bold text-white line-clamp-1">
                          {idx + 1}. {item.nama_barang}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-yellow-400 border border-slate-700 shrink-0">
                          {item.lokasi_penyimpanan || 'Lab'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-0.5">
                        <span>Modal: <strong className="text-emerald-400">Rp {modalVal.toLocaleString('id-ID')}</strong></span>
                        <span>Jual: <strong className="text-cyan-400">Rp {jualVal.toLocaleString('id-ID')}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Chip Spesifikasi Singkat */}
                  {(item.spesifikasi?.daya || item.spesifikasi?.tipe_jack) && (
                    <div className="flex flex-wrap items-center gap-1 my-1 text-[9px] font-mono">
                      {item.spesifikasi.daya && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-bold">
                          {item.spesifikasi.daya}
                        </span>
                      )}
                      {item.spesifikasi.tipe_jack && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-cyan-300 border border-slate-700/80 truncate max-w-[130px]">
                          {item.spesifikasi.tipe_jack}
                        </span>
                      )}
                      {item.qty > 1 && (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                          {item.qty}x
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Margin: <strong className="text-cyan-300">+{marginPct}%</strong></span>
                    {isSelected ? (
                      <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-0.5">
                        <Check size={11} /> Aktif di Form
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 hover:text-slate-300">Klik untuk edit</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2 rounded-xl bg-indigo-900/20 border border-indigo-500/20 text-[11px] text-indigo-200/90 flex items-center justify-between">
            <span>💡 Total modal {batchItems.length} item: <strong className="font-mono text-emerald-400">Rp {batchItems.reduce((acc, curr) => acc + (Number(curr.harga_modal) || 0), 0).toLocaleString('id-ID')}</strong></span>
            <span className="text-indigo-400 font-medium hidden sm:inline">Pilih kartu atau simpan sekaligus</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalVoiceAI;
