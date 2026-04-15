import React from 'react';
import { X } from 'lucide-react';

const AssetModal = ({ isOpen, onClose, formData, setFormData, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[2.5rem] p-6 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-cyan-500 italic uppercase">Registrasi Aset</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          <input required placeholder="Nama Barang" className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-white/5 focus:border-cyan-500 text-sm" value={formData.nama_barang} onChange={e => setFormData({ ...formData, nama_barang: e.target.value })} />
          <input placeholder="Kode Unit (Contoh: L-042)" className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-white/5 focus:border-cyan-500 text-sm font-mono text-cyan-400" value={formData.kode_unit} onChange={e => setFormData({ ...formData, kode_unit: e.target.value })} />
          
          <div className="grid grid-cols-2 gap-3">
            <input type="number" placeholder="Modal" className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-white/5 focus:border-cyan-500 text-sm font-mono text-emerald-400" value={formData.harga_modal} onChange={e => setFormData({ ...formData, harga_modal: e.target.value })} />
            <input type="number" placeholder="Target" className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-white/5 focus:border-cyan-500 text-sm font-mono text-cyan-400" value={formData.harga_jual_target} onChange={e => setFormData({ ...formData, harga_jual_target: e.target.value })} />
          </div>

          <div className="flex gap-2">
            {[1, 2, 3].map(l => (
              <button key={l} type="button" onClick={() => setFormData({ ...formData, kategori_layer: l })} className={`flex-1 py-3 rounded-xl text-[10px] font-black border transition-all ${formData.kategori_layer === l ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-transparent text-slate-500'}`}>L{l}</button>
            ))}
          </div>

          <input placeholder="Lokasi Penyimpanan" className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-white/5 focus:border-cyan-500 text-sm" value={formData.lokasi_penyimpanan} onChange={e => setFormData({ ...formData, lokasi_penyimpanan: e.target.value })} />
          <textarea placeholder="Catatan teknis..." className="w-full bg-slate-800 p-4 rounded-2xl outline-none border border-white/5 focus:border-cyan-500 text-xs min-h-[80px]" value={formData.catatan_teknis} onChange={e => setFormData({ ...formData, catatan_teknis: e.target.value })} />
          
          <button className="w-full bg-cyan-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-4 transition-all active:scale-95 shadow-lg shadow-cyan-900/20">Amankan ke Gudang</button>
        </form>
      </div>
    </div>
  );
};

export default AssetModal;