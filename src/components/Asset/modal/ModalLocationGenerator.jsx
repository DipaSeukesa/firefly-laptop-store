import React from 'react';
import { MapPin } from 'lucide-react';

/**
 * Generator Alamat Matriks Fisik Lab (Rak, Wadah, Cup, dan Tombol Cepat Stasiun)
 */
const ModalLocationGenerator = ({
  lokasiPenyimpanan,
  onLocationChange,
  selRak,
  setSelRak,
  selWadah,
  setSelWadah,
  selWadahNo,
  setSelWadahNo,
  selCupType,
  setSelCupType,
  selCupNo,
  setSelCupNo,
  onResetLocation
}) => {
  return (
    <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <MapPin size={13} className="text-cyan-400" />
          Alamat Fisik Lab Penyimpanan
        </label>
        {lokasiPenyimpanan && (
          <button
            type="button"
            onClick={onResetLocation}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
          >
            Reset Alamat
          </button>
        )}
      </div>

      <input
        placeholder="Contoh: RK2-BX1-CA10"
        className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-sm font-mono text-yellow-400 uppercase tracking-wider outline-none"
        value={lokasiPenyimpanan || ''}
        onChange={e => onLocationChange(e.target.value.toUpperCase())}
      />

      {/* Step 1: Rak Utama */}
      <div>
        <span className="text-[11px] font-bold text-slate-400 block mb-1">
          Langkah 1: Pilih Rak Fisik
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'RK1', name: 'RK1 (Rak Kaca 1)' },
            { id: 'RK2', name: 'RK2 (Rak Kaca 2)' },
            { id: 'RK3', name: 'RK3 (Rak Gudang)' }
          ].map(rak => (
            <button
              key={rak.id}
              type="button"
              onClick={() => setSelRak(rak.id)}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                selRak === rak.id
                  ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {rak.name}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Wadah Induk */}
      <div>
        <span className="text-[11px] font-bold text-slate-400 block mb-1">
          Langkah 2: Wadah Induk & Nomor
        </span>
        <div className="grid grid-cols-3 gap-1.5 mb-1.5">
          {[
            { id: 'BX', label: '🍩 Donat (1-30)' },
            { id: 'TB', label: '🧰 Toolbox (1-5)' },
            { id: 'TW', label: '📦 Box 500ml' }
          ].map(w => (
            <button
              key={w.id}
              type="button"
              onClick={() => { setSelWadah(w.id); setSelWadahNo(''); }}
              className={`py-2 rounded-lg text-xs font-medium transition-all ${
                selWadah === w.id
                  ? 'bg-indigo-500/20 border border-indigo-500 text-indigo-400'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>

        {selWadah && (
          <select
            value={selWadahNo}
            onChange={e => setSelWadahNo(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-white outline-none focus:border-indigo-500"
          >
            <option value="">-- Pilih Nomor Wadah --</option>
            {Array.from({ length: selWadah === 'BX' ? 30 : selWadah === 'TB' ? 5 : 50 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>Nomor Wadah #{num}</option>
            ))}
          </select>
        )}
      </div>

      {/* Step 3: Cup Saos */}
      <div>
        <span className="text-[11px] font-bold text-slate-400 block mb-1">
          Langkah 3: Ukuran Cup & Nomor (1-200)
        </span>
        <div className="grid grid-cols-3 gap-1.5 mb-1.5">
          {[
            { id: 'CA', label: 'Cup A (35ml)' },
            { id: 'CB', label: 'Cup B (25ml)' },
            { id: 'CC', label: 'Cup C (15ml)' }
          ].map(cup => (
            <button
              key={cup.id}
              type="button"
              onClick={() => { setSelCupType(cup.id); setSelCupNo(''); }}
              className={`py-2 rounded-lg text-xs font-medium transition-all ${
                selCupType === cup.id
                  ? 'bg-amber-500/20 border border-amber-500 text-amber-400'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cup.label}
            </button>
          ))}
        </div>

        {selCupType && (
          <select
            value={selCupNo}
            onChange={e => setSelCupNo(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-white outline-none focus:border-amber-500"
          >
            <option value="">-- Pilih Nomor Cup (1 - 200) --</option>
            {Array.from({ length: 200 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>Cup Nomor #{num}</option>
            ))}
          </select>
        )}
      </div>

      {/* Tombol Cepat (Macro) */}
      <div className="pt-2 border-t border-slate-800">
        <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">
          Akses Cepat Meja & Stasiun
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'TB-DAILY', label: '🧰 TB Daily' },
            { id: 'TB-SOLDER', label: '🔥 TB Solder' },
            { id: 'MJ1', label: '🔥 Meja 1: Solder' },
            { id: 'MJ2', label: '🔧 Meja 2: Bongkar' },
            { id: 'MJ3', label: '🔬 Meja 3: Program' }
          ].map(macro => (
            <button
              key={macro.id}
              type="button"
              onClick={() => {
                onResetLocation();
                onLocationChange(macro.id);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
            >
              {macro.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModalLocationGenerator;
