import React, { useState } from 'react';
import { Zap, Plus, Trash2 } from 'lucide-react';

/**
 * Komponen Editor Spesifikasi Teknis Dinamis (JSON)
 */
const ModalSpecsEditor = ({ spesifikasi = {}, onUpdateSpecs }) => {
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  const specEntries = Object.entries(spesifikasi || {});

  const handleAdd = () => {
    if (!newKey.trim() || !newVal.trim()) return;
    const cleanKey = newKey.trim().toLowerCase().replace(/\s+/g, '_');
    onUpdateSpecs({
      ...(spesifikasi || {}),
      [cleanKey]: newVal.trim()
    });
    setNewKey('');
    setNewVal('');
  };

  const handleDelete = (keyToDelete) => {
    const updated = { ...(spesifikasi || {}) };
    delete updated[keyToDelete];
    onUpdateSpecs(updated);
  };

  return (
    <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Zap size={13} className="text-amber-400" />
          Spesifikasi Teknis Dinamis (JSON)
        </label>
        <span className="text-[10px] text-slate-500 font-mono">
          {specEntries.length} atribut
        </span>
      </div>

      {/* List Atribut Spesifikasi Saat Ini */}
      {specEntries.length > 0 ? (
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {specEntries.map(([key, val]) => (
            <div key={key} className="flex items-center justify-between gap-2 p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono">
              <div className="min-w-0 flex items-center gap-2">
                <span className="text-cyan-400 font-semibold capitalize truncate">{key.replace(/_/g, ' ')}:</span>
                <span className="text-slate-200 truncate">{String(val)}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(key)}
                className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors shrink-0"
                title="Hapus atribut"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic py-1">
          Belum ada spesifikasi teknis khusus. Gunakan Asisten Suara/AI di atas atau tambahkan secara manual di bawah.
        </p>
      )}

      {/* Tambah Atribut Baru Manual */}
      <div className="flex items-center gap-1.5 pt-1">
        <input
          type="text"
          placeholder="Nama spek (e.g. voltase)"
          value={newKey}
          onChange={e => setNewKey(e.target.value)}
          className="w-1/3 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none focus:border-cyan-500 font-mono"
        />
        <input
          type="text"
          placeholder="Nilai (e.g. 20V 4.5A Slim Tip)"
          value={newVal}
          onChange={e => setNewVal(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none focus:border-cyan-500 font-mono"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-lg transition-colors shrink-0"
          title="Tambah atribut spesifikasi"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
};

export default ModalSpecsEditor;
