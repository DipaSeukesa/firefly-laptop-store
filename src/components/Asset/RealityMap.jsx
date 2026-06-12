import React from 'react';
import { Grid, Layers, Hammer, Laptop, Terminal } from 'lucide-react';

const RealityMap = ({ assets, onSelectLocation }) => {
  
  // REAL-TIME FILTER: Akurat membaca string lokasi_penyimpanan dari Supabase
  const getStorageDensity = (locId) => {
    return assets.filter(a => {
      if (!a.lokasi_penyimpanan) return false;
      const cleanLoc = a.lokasi_penyimpanan.toUpperCase();
      
      // COCOK jika lokasi diawali dengan kode (misal: "RK1-BX1") atau mengandung kode utuh
      const parts = cleanLoc.split('-');
      return parts.includes(locId) || cleanLoc.startsWith(locId);
    }).length;
  };

  // 6 ZONA MONITORING REALITAS UTAMA (Sesuai Struktur Lab & Workspace Baru)
  const containers = [
    // --- SEKTOR RAK KACA & PENYIMPANAN ---
    { 
      id: 'RK1', 
      name: '📱 Rak Kaca 1', 
      type: 'RAK UTAMA', 
      tools: 'Laptop Dagangan, Smartphone, Sparepart Premium (P1)', 
      bg: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400' 
    },
    { 
      id: 'RK2', 
      name: '🍩 Rak Kaca 2', 
      type: 'RAK UTAMA', 
      tools: 'Wadah Induk Box Donat, Komponen Mikro & Sensor (P2)', 
      bg: 'border-blue-500/30 bg-blue-500/5 text-blue-400' 
    },
    { 
      id: 'RK3', 
      name: '📦 Rak Terbuka', 
      type: 'GUDANG BEBAS', 
      tools: 'Box Besar, Stok Kabel, Material Mentah & Makro', 
      bg: 'border-purple-500/30 bg-purple-500/5 text-purple-400' 
    },

    // --- SEKTOR WORKSPACE AKTIF (MEJA KERJA) ---
    { 
      id: 'MJ1', 
      name: '🔥 Meja 1: Solder & Perakitan', 
      type: 'STASIUN KERJA', 
      tools: 'Stasiun Solder, Timah, Toolbox Alat Kerja Utama (P3)', 
      bg: 'border-orange-500/30 bg-orange-500/5 text-orange-400' 
    },
    { 
      id: 'MJ2', 
      name: '🔧 Meja 2: Bongkar & Mekanik', 
      type: 'STASIUN KERJA', 
      tools: 'Area Pembongkaran, Toolset Obeng, Repositori Part Rusak', 
      bg: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400' 
    },
    { 
      id: 'MJ3', 
      name: '🔬 Meja 3: Program & Cetak 3D', 
      type: 'STASIUN KERJA', 
      tools: 'PC Programming, ST-Link, Printer 3D, Modul IoT Transit', 
      bg: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' 
    },
  ];

  return (
    <div className="bg-slate-900/60 p-5 rounded-[2rem] border border-white/5 backdrop-blur-md mb-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Grid size={16} className="text-cyan-400" />
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Peta Kepadatan Wadah Fisik</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {containers.map((box) => {
          const itemCount = getStorageDensity(box.id);
          
          return (
            <div 
              key={box.id}
              onClick={() => onSelectLocation(box.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] active:scale-95 flex flex-col justify-between min-h-[120px] ${box.bg}`}
            >
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                    {box.type}
                  </span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full transition-colors ${itemCount > 0 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-500'}`}>
                    {itemCount} Items
                  </span>
                </div>
                <h4 className="font-bold text-xs text-white mt-1">{box.name}</h4>
                <p className="text-[9px] text-slate-400 mt-1 line-clamp-2 italic leading-relaxed">{box.tools}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[8px] font-mono tracking-tight text-slate-500 uppercase">
                <span>FILTER ID: {box.id}</span>
                <span className={itemCount > 0 ? "text-cyan-400 font-bold animate-pulse flex items-center gap-1" : "flex items-center gap-1"}>
                  {itemCount > 0 ? '● Terisi' : '○ Kosong'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RealityMap;