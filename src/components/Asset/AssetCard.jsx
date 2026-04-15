import React from 'react';
import { Trash2, MapPin, Calendar, Clock } from 'lucide-react';

const AssetCard = ({ asset, age, onDelete, onUpdateStatus }) => {
  return (
    <div className="bg-slate-900 border border-white/5 p-4 rounded-[2rem] group hover:border-cyan-500/30 transition-all">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${asset.kategori_layer === 1 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
              L{asset.kategori_layer}
            </span>
            <h3 className="text-sm font-bold text-slate-200">{asset.nama_barang}</h3>
            {age > 30 && asset.status_barang === 'Tersedia' && (
              <span className="flex items-center gap-1 text-[7px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full font-bold">
                <Clock size={8} /> STOK LAMA
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-mono text-slate-500 bg-white/5 px-2 rounded">#{asset.kode_unit || 'NO-CODE'}</span>
            <p className="text-[10px] text-slate-400 italic leading-relaxed">{asset.catatan_teknis || '-'}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1 text-[9px] text-slate-500">
              <MapPin size={10} className="text-rose-500" /> {asset.lokasi_penyimpanan || 'Gudang'}
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-500">
              <Calendar size={10} className="text-blue-500" /> {age} Hari
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-mono font-bold text-emerald-500">Rp {Number(asset.harga_modal).toLocaleString()}</p>
          {asset.kategori_layer === 1 && (
            <p className="text-[8px] text-slate-600 font-mono italic">Target: {Number(asset.harga_jual_target).toLocaleString()}</p>
          )}
          <div className="flex justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onDelete(asset.id)} className="text-slate-600 hover:text-rose-500"><Trash2 size={14} /></button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <select value={asset.status_barang}
          onChange={(e) => onUpdateStatus(asset.id, e.target.value)}
          className={`bg-transparent text-[10px] font-black uppercase tracking-widest outline-none ${asset.status_barang === 'Servis' ? 'text-rose-500' : 'text-cyan-500'}`}
        >
          <option value="Tersedia">Tersedia</option>
          <option value="Terjual">Terjual</option>
          <option value="Dipakai">Dipakai</option>
          <option value="Servis">Perlu Servis</option>
        </select>
        <div className="text-[8px] text-slate-600 uppercase font-bold">
          Update: {new Date(asset.updated_at).toLocaleDateString('id-ID')}
        </div>
      </div>
    </div>
  );
};

export default AssetCard;