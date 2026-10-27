import React from 'react';
import { Layers, Plus } from 'lucide-react';

/**
 * Banner Deteksi Duplikasi Seri / Part Number (Kecuali L1 Laptop Bekas)
 * Memberikan opsi 1-klik untuk menambah stok ke barang eksisting
 */
const ModalDuplicateAlert = ({ duplicateMatch, qty = 1, onIncrementStock, onClose }) => {
  if (!duplicateMatch) return null;

  const currentQty = Number(duplicateMatch.qty) || 1;
  const addQty = Number(qty) || 1;
  const newTotal = currentQty + addQty;

  const handleQuickAdd = async () => {
    if (onIncrementStock) {
      await onIncrementStock(duplicateMatch.id, addQty);
      if (onClose) onClose();
    }
  };

  return (
    <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2 animate-in fade-in">
      <div className="flex items-center justify-between">
        <span className="font-bold flex items-center gap-1.5 text-amber-300 uppercase tracking-wider">
          <Layers size={14} className="text-amber-400" /> Seri / Barang Serupa Sudah Ada!
        </span>
        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 font-mono text-cyan-300 font-bold">
          Stok Saat Ini: {currentQty} Pcs
        </span>
      </div>
      <p className="text-slate-300 leading-relaxed text-[11px]">
        Unit <strong>"{duplicateMatch.nama_barang}"</strong> (#{duplicateMatch.kode_unit || 'NO-CODE'}) sudah tersimpan di {duplicateMatch.lokasi_penyimpanan || 'Lab'}.
      </p>
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <button
          type="button"
          onClick={handleQuickAdd}
          className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 text-xs active:scale-95"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>Tambah ke Stok Unit Ini ({currentQty} + {addQty} = {newTotal} Pcs)</span>
        </button>
        <span className="text-slate-500 text-[10px] italic">atau tetap simpan di bawah untuk membuat baris baru terpisah.</span>
      </div>
    </div>
  );
};

export default ModalDuplicateAlert;
