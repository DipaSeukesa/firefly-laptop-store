import React, { useState } from 'react';
import { Grid, ChevronDown, ChevronUp, Layers, HardDrive } from 'lucide-react';

const RealityMap = ({ assets, onSelectLocation }) => {
  // FITUR UTAMA: Default ditutup (hide) agar dasbor ringkas
  const [isOpen, setIsOpen] = useState(false);

  const getStorageDensity = (locId) => {
    return assets.reduce((total, a) => {
      if (!a.lokasi_penyimpanan) return total;
      const cleanLoc = a.lokasi_penyimpanan.toUpperCase();
      const parts = cleanLoc.split('-');
      const isMatched = parts.includes(locId) || cleanLoc.startsWith(locId);
      return isMatched ? total + (a.qty || 1) : total;
    }, 0);
  };

  // 6 ZONA MONITORING REALITAS UTAMA
  const containers = [
    {
      id: 'RK1',
      name: '📱 Rak Kaca 1',
      type: 'RAK UTAMA',
      tools: 'Laptop Dagangan, Smartphone, Sparepart Premium (P1)',
      bg: 'border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400',
      barColor: 'bg-cyan-500'
    },
    {
      id: 'RK2',
      name: '🍩 Rak Kaca 2',
      type: 'RAK UTAMA',
      tools: 'Wadah Induk Box Donat, Komponen Mikro & Sensor (P2)',
      bg: 'border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400',
      barColor: 'bg-blue-500'
    },
    {
      id: 'RK3',
      name: '📦 Rak Terbuka',
      type: 'GUDANG BEBAS',
      tools: 'Box Besar, Stok Kabel, Material Mentah & Makro',
      bg: 'border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 text-purple-400',
      barColor: 'bg-purple-500'
    },
    {
      id: 'MJ1',
      name: '🔥 Meja 1: Solder & Perakitan',
      type: 'STASIUN KERJA',
      tools: 'Stasiun Solder, Timah, Toolbox Alat Kerja Utama (P3)',
      bg: 'border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 text-orange-400',
      barColor: 'bg-orange-500'
    },
    {
      id: 'MJ2',
      name: '🔧 Meja 2: Bongkar & Mekanik',
      type: 'STASIUN KERJA',
      tools: 'Area Pembongkaran, Toolset Obeng, Repositori Part Rusak',
      bg: 'border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-400',
      barColor: 'bg-yellow-500'
    },
    {
      id: 'MJ3',
      name: '🔬 Meja 3: Program & Cetak 3D',
      type: 'STASIUN KERJA',
      tools: 'PC Programming, ST-Link, Printer 3D, Modul IoT Transit',
      bg: 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400',
      barColor: 'bg-emerald-500'
    },
  ];

  return (
    <div className="bg-slate-900/40 rounded-[2rem] border border-white/5 backdrop-blur-md mb-6 p-4 transition-all duration-300">
      
      {/* HEADER TOMBOL: KLIK UNTUK TOGGLE SHOW/HIDE */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none px-2 py-1 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-xl transition-colors ${isOpen ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-slate-400'}`}>
            <Grid size={15} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">Peta Kepadatan Wadah Fisik</h3>
            <p className="text-[8px] text-slate-500 font-medium uppercase mt-0.5 tracking-wider">
              {isOpen ? 'Klik untuk menyembunyikan peta lab' : 'Klik untuk memantau kapasitas lokasi'}
            </p>
          </div>
        </div>
        
        <div className="text-slate-500 bg-white/5 p-1.5 rounded-full border border-white/5 group-hover:text-slate-300">
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* PANEL PETA: MELUNCUR TERBUKA HANYA JIKA STATE ISOPEN === TRUE */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isOpen ? 'max-h-[2000px] opacity-100 mt-5 pt-4 border-t border-white/5' : 'max-h-0 opacity-0 pointer-events-none'
      }`}>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {containers.map((box) => {
            const itemCount = getStorageDensity(box.id);
            
            // LOGIKA GRAFIK KEPADATAN: Maksimal batas visual ideal adalah 20 pcs per wadah
            const maxCapacityLimit = 20;
            const percentage = Math.min(100, (itemCount / maxCapacityLimit) * 100);
            const isOverloaded = itemCount >= maxCapacityLimit;

            return (
              <div
                key={box.id}
                onClick={() => onSelectLocation(box.id)}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer active:scale-95 flex flex-col justify-between min-h-[140px] relative overflow-hidden group ${box.bg}`}
              >
                {/* Efek Garis Menyala Halus Pada Sisi Atas Card saat Di-hover */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-950/40 text-slate-400 border border-white/5">
                      {box.type}
                    </span>
                    <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-md transition-all ${
                      itemCount > 0 
                        ? isOverloaded 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' 
                          : 'bg-white/10 text-white' 
                        : 'bg-white/5 text-slate-500'
                    }`}>
                      {itemCount} Pcs
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-xs text-slate-100 group-hover:text-white transition-colors">{box.name}</h4>
                  <p className="text-[9px] text-slate-400/80 mt-1 line-clamp-2 italic leading-relaxed font-sans">{box.tools}</p>
                </div>

                {/* VISUALISASI UTAMA: GRAFIK PROGRESS KEPADATAN FISIK */}
                <div className="mt-3.5 mb-2">
                  <div className="flex justify-between items-center text-[7px] font-mono text-slate-500 uppercase mb-1 tracking-wider">
                    <span>Density Ratio</span>
                    <span className={isOverloaded ? 'text-rose-400 font-bold' : ''}>
                      {isOverloaded ? '⚠️ OVERLOAD' : `${Math.round(percentage)}%`}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverloaded ? 'bg-gradient-to-r from-rose-600 to-rose-400 animate-pulse' : box.barColor
                      }`}
                      style={{ width: `${itemCount > 0 ? Math.max(5, percentage) : 0}%` }}
                    />
                  </div>
                </div>

                {/* FOOTER METADATA CARD */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[8px] font-mono tracking-tight text-slate-500 uppercase">
                  <span>ZONE ID: {box.id}</span>
                  <span className={itemCount > 0 ? "text-slate-300 font-bold flex items-center gap-1" : "flex items-center gap-1"}>
                    <span className={`w-1 h-1 rounded-full ${itemCount > 0 ? isOverloaded ? 'bg-rose-500 animate-ping' : 'bg-emerald-400' : 'bg-slate-700'}`} />
                    {itemCount > 0 ? isOverloaded ? 'Penuh' : 'Terisi' : 'Kosong'}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
        
      </div>
    </div>
  );
};

export default RealityMap;