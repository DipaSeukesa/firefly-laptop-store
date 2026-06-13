import React, { useState, useEffect } from 'react';
import { X, MapPin, Cpu } from 'lucide-react';

const AssetModal = ({ isOpen, onClose, formData, setFormData, onSave, existingAssets = [] }) => {
  // if (!isOpen) return null;

  // --- STATE MANDIRI UNTUK GENERATOR ALAMAT MATRIKS ---
  const [selRak, setSelRak] = useState('');
  const [selWadah, setSelWadah] = useState('');
  const [selWadahNo, setSelWadahNo] = useState('');
  const [selCupType, setSelCupType] = useState('');
  const [selCupNo, setSelCupNo] = useState('');

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

  // EFFECT 2: Automasi Kode Unit Berdasarkan Level Prioritas & Potongan Alamat Akhir
  useEffect(() => {
    // JIKA MEMILIH P1 (DAGANGAN / LAPTOP): Auto-Increment L-XXXX berbasis Database
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
    }
    // JIKA MEMILIH P2 (STOK / SENSOR): SN- + "POTONGAN ALAMAT PALING UJUNG"
    else if (formData.kategori_layer === 2) {
      if (formData.lokasi_penyimpanan) {
        // Pecah string alamat dengan '-' sebagai pemisah, lalu ambil elemen terakhir (.pop())
        const alamatArray = formData.lokasi_penyimpanan.split('-');
        const alamatUjung = alamatArray[alamatArray.length - 1]; // Mengambil bagian paling akhir (Misal: CB8 atau CA10)

        setFormData(prev => ({ ...prev, kode_unit: `SN-${alamatUjung}` }));
      } else {
        setFormData(prev => ({ ...prev, kode_unit: 'SN-BELUM-LENGKAP' }));
      }
    }
    // JIKA MEMILIH P3 (ALAT SOLDER / TOOLS): Kosongkan
    else if (formData.kategori_layer === 3) {
      setFormData(prev => ({ ...prev, kode_unit: '' }));
    }
  }, [formData.kategori_layer, formData.lokasi_penyimpanan, existingAssets, setFormData]);

  // Fungsi Reset Alamat Matriks
  const resetMatrixLocation = () => {
    setSelRak('');
    setSelWadah('');
    setSelWadahNo('');
    setSelCupType('');
    setSelCupNo('');
    setFormData(prev => ({ ...prev, lokasi_penyimpanan: '', kode_unit: '' }));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[2.5rem] p-6 max-h-[90vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-200">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-cyan-500 italic uppercase text-sm tracking-wide">Registrasi Aset</h3>
          <button onClick={onClose} type="button" className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={onSave} className="space-y-4">

          {/* NAMA BARANG */}
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest pl-1">Identitas</span>
            <input
              required
              placeholder="Nama Barang (contoh: Sensor MQ-2)"
              className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-white/5 focus:border-cyan-500/50 text-sm text-white transition-colors"
              value={formData.nama_barang || ''}
              onChange={e => setFormData({ ...formData, nama_barang: e.target.value })}
            />
          </div>

          {/* LEVEL PRIORITAS ASET */}
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest pl-1">
              Level Prioritas & Arus Modal
            </span>
            <div className="flex gap-2">
              {[
                { id: 1, title: 'P1: Dagangan / Laptop', desc: 'Perputaran Cepat' },
                { id: 2, title: 'P2: Stok / Sensor', desc: 'Simpanan / R&D' },
                { id: 3, title: 'P3: Alat Solder', desc: 'Infrastruktur Kerja' }
              ].map(level => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, kategori_layer: level.id })}
                  className={`flex-1 p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${formData.kategori_layer === level.id
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-md shadow-cyan-500/5'
                    : 'bg-slate-800 border-transparent text-slate-500 hover:text-slate-400'
                    }`}
                >
                  <span className="text-[10px] font-black">{level.title}</span>
                  <span className="text-[7px] opacity-60 font-medium mt-0.5">{level.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* KODE UNIT (DENGAN RE-RENDER KEY AMAN DARI WARNING COMPILER) */}
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest pl-1 flex items-center gap-1">
              <Cpu size={10} className="text-cyan-500" /> KTP Identitas / Kode Unit
            </span>
            <input
              key={`kode-unit-layer-${formData.kategori_layer || 1}`}
              placeholder={formData.kategori_layer === 3 ? "Tidak membutuhkan kode (TOOLS)" : "Kode Unit Otomatis"}
              readOnly={formData.kategori_layer === 1 || formData.kategori_layer === 2}
              className={`w-full p-4 rounded-2xl outline-none border border-white/5 text-sm font-mono tracking-wider transition-colors ${formData.kategori_layer === 3
                ? 'bg-slate-800/40 text-slate-600 italic cursor-not-allowed'
                : 'bg-slate-800 text-cyan-400 focus:border-cyan-500/50'
                }`}
              value={formData.kode_unit || ''}
              onChange={e => setFormData({ ...formData, kode_unit: e.target.value.toUpperCase() })}
            />
          </div>

          {/* BUDGETING (MODAL & TARGET) */}
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest pl-1">Finansial</span>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Modal"
                className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-white/5 focus:border-cyan-500/50 text-sm font-mono text-emerald-400 transition-colors"
                value={formData.harga_modal || ''}
                onChange={e => setFormData({ ...formData, harga_modal: e.target.value })}
              />
              <input
                type="number"
                placeholder="Target"
                className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-white/5 focus:border-cyan-500/50 text-sm font-mono text-cyan-400 transition-colors"
                value={formData.harga_jual_target || ''}
                onChange={e => setFormData({ ...formData, harga_jual_target: e.target.value })}
              />
            </div>
          </div>

          {/* SISIPKAN INPUT FIELD QTY BARU INI DI DALAM FILE ASSETMODAL.JSX KAMU */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">Kuantitas Barang (Qty)</label>
            <input
              type="number"
              min="1"
              required
              value={formData.qty}
              onChange={(e) => setFormData(prev => ({ ...prev, qty: Math.max(1, parseInt(e.target.value) || 1) }))}
              className="w-full bg-slate-900 border border-white/10 rounded-2xl p-3 text-sm outline-none text-white focus:border-cyan-500/50 font-mono"
              placeholder="Contoh: 1 atau 50"
            />
          </div>

          {/* REALITY MAP ADDRESS (LOKASI) */}
          <div className="flex flex-col gap-2 p-4 rounded-3xl bg-slate-950/40 border border-white/5">
            <div className="flex justify-between items-center pl-1">
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                <MapPin size={10} className="text-cyan-500" /> Alamat Fisik Penyimpanan
              </span>
              {formData.lokasi_penyimpanan && (
                <button
                  type="button"
                  onClick={resetMatrixLocation}
                  className="text-[8px] font-black text-rose-500 uppercase tracking-tighter hover:underline"
                >
                  [ Clear ]
                </button>
              )}
            </div>

            <input
              placeholder="Contoh: RK2-BX1-CA10"
              className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-white/5 focus:border-cyan-500/50 text-sm font-mono text-yellow-400 uppercase tracking-wider transition-colors"
              value={formData.lokasi_penyimpanan || ''}
              onChange={e => setFormData({ ...formData, lokasi_penyimpanan: e.target.value.toUpperCase() })}
            />



            {/* BLOCK GENERATOR 1: PILIHAN RAK (1 - 3) */}
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[7px] font-black uppercase text-slate-500 tracking-wider pl-0.5">1. Pilih Rak Utama</span>
              <div className="grid grid-cols-3 gap-1">
                {['RK1', 'RK2', 'RK3'].map(rak => (
                  <button
                    key={rak} type="button" onClick={() => setSelRak(rak)}
                    className={`py-1.5 rounded-lg text-[9px] font-black transition-all ${selRak === rak ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400' : 'bg-slate-800 border border-transparent text-slate-400'}`}
                  >
                    {rak}
                  </button>
                ))}
              </div>
            </div>

            {/* BLOCK GENERATOR 2: WADAH INDUK & ANGKA */}
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[7px] font-black uppercase text-slate-500 tracking-wider pl-0.5">2. Wadah Induk & Nomor</span>
              <div className="grid grid-cols-3 gap-1 mb-1">
                {[
                  { id: 'BX', label: '🍩 Donat (1-30)' },
                  { id: 'TB', label: '🧰 Toolbox (1-5)' },
                  { id: 'TW', label: '📦 Box 500ml (1-50)' }
                ].map(w => (
                  <button
                    key={w.id} type="button" onClick={() => { setSelWadah(w.id); setSelWadahNo(''); }}
                    className={`py-1.5 rounded-lg text-[8px] font-bold transition-all ${selWadah === w.id ? 'bg-indigo-500/20 border border-indigo-500 text-indigo-400' : 'bg-slate-800 border border-transparent text-slate-400'}`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>

              {selWadah && (
                <select
                  value={selWadahNo}
                  onChange={e => setSelWadahNo(e.target.value)}
                  className="w-full bg-slate-800 p-2 rounded-xl text-xs font-mono text-slate-300 outline-none border border-white/5 focus:border-indigo-500"
                >
                  <option value="">-- Pilih Nomor Wadah --</option>
                  {Array.from({ length: selWadah === 'BX' ? 30 : selWadah === 'TB' ? 5 : 50 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>Nomor {num}</option>
                  ))}
                </select>
              )}
            </div>

            {/* BLOCK GENERATOR 3: UKURAN CUP SAOS */}
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[7px] font-black uppercase text-slate-500 tracking-wider pl-0.5">3. Ukuran Cup Saos & Nomor (1-200)</span>
              <div className="grid grid-cols-3 gap-1 mb-1">
                {[
                  { id: 'CA', label: 'Cup A 35ml' },
                  { id: 'CB', label: 'Cup B 25ml' },
                  { id: 'CC', label: 'Cup C 15ml' }
                ].map(cup => (
                  <button
                    key={cup.id} type="button" onClick={() => { setSelCupType(cup.id); setSelCupNo(''); }}
                    className={`py-1.5 rounded-lg text-[8px] font-black transition-all ${selCupType === cup.id ? 'bg-amber-500/20 border border-amber-500 text-amber-400' : 'bg-slate-800 border border-transparent text-slate-400'}`}
                  >
                    {cup.label}
                  </button>
                ))}
              </div>

              {selCupType && (
                <select
                  value={selCupNo}
                  onChange={e => setSelCupNo(e.target.value)}
                  className="w-full bg-slate-800 p-2 rounded-xl text-xs font-mono text-slate-300 outline-none border border-white/5 focus:border-amber-500"
                >
                  <option value="">-- Pilih Nomor Cup (1-200) --</option>
                  {Array.from({ length: 200 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>Cup Nomor {num}</option>
                  ))}
                </select>
              )}
            </div>

            {/* MACRO AKSES CEPAT */}
            <div className="flex flex-col gap-1 mt-1 pt-2 border-t border-white/5">
              <span className="text-[7px] font-black uppercase text-slate-500 tracking-wider pl-0.5">Akses Cepat Alamat Makro</span>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'TB-DAILY', label: '🧰 TB Daily' },
                  { id: 'TB-SOLDER', label: '🔥 TB Solder' },
                  { id: 'MEJA-TESTING', label: '🔬 Meja Kerja' }
                ].map(macro => (
                  <button
                    key={macro.id} type="button"
                    onClick={() => {
                      resetMatrixLocation();
                      setFormData(prev => ({ ...prev, lokasi_penyimpanan: macro.id }));
                    }}
                    className="px-2 py-1 rounded-md text-[8px] font-bold bg-white/5 border border-white/5 text-slate-400 hover:text-cyan-400 transition-all"
                  >
                    {macro.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CATATAN TEKNIS */}
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest pl-1">Catatan Tambahan</span>
            <textarea
              placeholder="Tulis pin layout / kelengkapan disini..."
              className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-white/5 focus:border-cyan-500/50 text-xs text-slate-300 min-h-[80px] transition-colors"
              value={formData.catatan_teknis || ''}
              onChange={e => setFormData({ ...formData, catatan_teknis: e.target.value })}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button className="w-full bg-cyan-600 hover:bg-cyan-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-4 transition-all active:scale-95 shadow-lg shadow-cyan-900/20 text-white">
            Amankan ke Gudang
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssetModal;