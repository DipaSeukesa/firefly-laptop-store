import React, { useState } from 'react';
import { Trash2, Edit2, MapPin, Calendar, Clock, ChevronDown, ChevronUp, Tag } from 'lucide-react';

const AssetCard = ({ asset, age, onDelete, onUpdateStatus, onEditClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-900/60 border border-white/5 p-4 rounded-[1.5rem] group hover:border-cyan-500/30 hover:bg-slate-900 transition-all duration-300">
      
      {/* KONTEN UTAMA (RINGKAS & BERSIH) */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          
          {/* BARIS UTAMA: LAYER BADGE, NAMA, & STATUS KRITIS SAJA */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md tracking-wider ${
              asset.kategori_layer === 1 ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-400'
            }`}>
              L{asset.kategori_layer}
            </span>
            
            <h3 className="text-sm font-bold text-slate-200 truncate max-w-[180px]" title={asset.nama_barang}>
              {asset.nama_barang}
            </h3>

            {age > 30 && asset.status_barang === 'Tersedia' && (
              <span className="flex items-center gap-1 text-[8px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full font-bold animate-pulse">
                <Clock size={8} /> STOK LAMA
              </span>
            )}
          </div>

          {/* BARIS KEDUA: METADATA BARANG (KATEGORI, QTY, KODE) */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3 text-[10px] text-slate-400">
            <span className="font-mono text-slate-500 bg-white/5 px-1.5 py-0.2 rounded">
              #{asset.kode_unit || 'NO-CODE'}
            </span>
            
            <span className="text-slate-600">•</span>
            
            <span className="font-semibold text-cyan-400/90">
              {asset.qty || 1} Pcs
            </span>
          </div>

          {/* BARIS KETIGA: INFORMASI OPERASIONAL (LOKASI & UMUR) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
              <MapPin size={11} className="text-rose-500/80" /> 
              <span className="text-slate-400">{asset.lokasi_penyimpanan || 'Gudang'}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
              <Calendar size={11} className="text-blue-500/80" /> 
              <span className="text-slate-400">{age} Hari</span>
            </div>
          </div>

        </div>

        {/* KOLOM KANAN: FINANSIAL & AKSI QUICK HOVER */}
        <div className="text-right flex flex-col items-end justify-between h-full min-w-[100px]">
          <div>
            <p className="text-xs font-mono font-bold text-emerald-400">
              Rp {(Number(asset.harga_modal) * (asset.qty || 1)).toLocaleString()}
            </p>
            
            {asset.qty > 1 && (
              <p className="text-[8px] text-slate-500 font-mono mt-0.5">
                @{Number(asset.harga_modal).toLocaleString()}
              </p>
            )}
            
            {asset.kategori_layer === 1 && (
              <p className="text-[9px] text-slate-500 font-mono italic mt-0.5">
                Tgt: {(Number(asset.harga_jual_target) * (asset.qty || 1)).toLocaleString()}
              </p>
            )}
          </div>
          
          {/* TOMBOL EDIT / HAPUS (MUNCUL SAAT CARD DI-HOVER) */}
          <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
            <button onClick={() => onEditClick(asset)} className="p-1 text-slate-500 hover:text-cyan-400 rounded hover:bg-white/5 transition-colors" title="Edit Aset">
              <Edit2 size={12} />
            </button>
            <button onClick={() => onDelete(asset.id)} className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-white/5 transition-colors" title="Hapus Aset">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* SEPARATOR HALUS */}
      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
        
        {/* DROPDOWN STATUS BARANG */}
        <div className="relative flex items-center">
          <select 
            value={asset.status_barang}
            onChange={(e) => onUpdateStatus(asset.id, e.target.value)}
            className={`bg-slate-950/40 border border-white/5 rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none pr-5 ${
              asset.status_barang === 'Servis' ? 'text-rose-400 border-rose-500/20 bg-rose-950/20' : 
              asset.status_barang === 'Habis' ? 'text-slate-500' : 'text-cyan-400'
            }`}
          >
            <option value="Tersedia">Tersedia</option>
            <option value="Terjual">Terjual</option>
            <option value="Dipakai">Dipakai</option>
            <option value="Servis">Perlu Servis</option>
            <option value="Habis">Habis</option>
          </select>
          <ChevronDown size={8} className="absolute right-1.5 text-slate-500 pointer-events-none" />
        </div>

        {/* TOMBOL EXPAND CATATAN TEKNIS */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[9px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-tight"
          >
            {isExpanded ? 'Tutup Catatan' : 'Lihat Catatan'}
            {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
          
          <span className="text-slate-700">|</span>
          
          <div className="text-[8px] text-slate-500 font-mono font-medium">
            Up: {new Date(asset.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
          </div>
        </div>
      </div>

      {/* PANEL DRAWER DETAIL (Hanya meluncur terbuka jika di-klik "Lihat Catatan") */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-24 opacity-100 mt-2.5 pt-2.5 border-t border-dashed border-white/5' : 'max-h-0 opacity-0'
      }`}>
        <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-xl italic font-sans leading-relaxed border border-white/5">
          <span className="text-[9px] font-black uppercase text-slate-500 block mb-0.5 not-italic tracking-wider">Catatan Teknis / Deskripsi:</span>
          {asset.catatan_teknis || 'Tidak ada catatan teknis khusus untuk komponen ini.'}
        </p>
      </div>

    </div>
  );
};

export default AssetCard;