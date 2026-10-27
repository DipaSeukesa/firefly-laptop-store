import React, { useState } from 'react';
import { BarChart3, ChevronDown, ChevronUp, Info } from 'lucide-react';

const RealityMap = ({ assets, onSelectLocation }) => {
  // Default ditutup (hide) agar dasbor tetap rapi, mudah dibuka kapan saja
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

  // 6 ZONA MONITORING REALITAS FISIK
  const zones = [
    {
      id: 'RK1',
      name: 'Rak Kaca 1',
      category: 'Laptop & HP Dagangan (P1)',
      tools: 'Unit dagangan utama, smartphone, sparepart premium',
      barColor: 'from-cyan-500 to-cyan-400',
      badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
      glow: 'shadow-cyan-500/20'
    },
    {
      id: 'RK2',
      name: 'Rak Kaca 2',
      category: 'Box Donat & Sensor (P2)',
      tools: 'Wadah induk komponen mikro, IC, sensor lab',
      barColor: 'from-blue-500 to-blue-400',
      badgeColor: 'text-blue-400 bg-blue-950/60 border-blue-800/60',
      glow: 'shadow-blue-500/20'
    },
    {
      id: 'RK3',
      name: 'Rak Terbuka',
      category: 'Gudang Bebas & Makro',
      tools: 'Box besar, kabel gulung, material mentah & casing',
      barColor: 'from-purple-500 to-purple-400',
      badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
      glow: 'shadow-purple-500/20'
    },
    {
      id: 'MJ1',
      name: 'Meja 1: Solder',
      category: 'Stasiun Kerja Perakitan',
      tools: 'Stasiun solder, timah, toolbox alat kerja utama (P3)',
      barColor: 'from-orange-500 to-orange-400',
      badgeColor: 'text-orange-400 bg-orange-950/60 border-orange-800/60',
      glow: 'shadow-orange-500/20'
    },
    {
      id: 'MJ2',
      name: 'Meja 2: Bongkar',
      category: 'Area Pembongkaran & Servis',
      tools: 'Toolset obeng, repositori part servis, unit perbaikan',
      barColor: 'from-amber-500 to-amber-400',
      badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
      glow: 'shadow-amber-500/20'
    },
    {
      id: 'MJ3',
      name: 'Meja 3: Program',
      category: 'Stasiun IoT & Cetak 3D',
      tools: 'PC programming, ST-Link, 3D printer, modul IoT transit',
      barColor: 'from-emerald-500 to-emerald-400',
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
      glow: 'shadow-emerald-500/20'
    },
  ];

  // Hitung total kapasitas lab (Masing-masing batas visual 20 unit)
  const maxCapacityPerZone = 20;
  const totalMaxCapacity = zones.length * maxCapacityPerZone; // 120 Unit
  const totalLabUnits = zones.reduce((acc, z) => acc + getStorageDensity(z.id), 0);
  const totalLabPercentage = Math.round((totalLabUnits / totalMaxCapacity) * 100);

  return (
    <div className="bg-slate-900/70 rounded-2xl border border-slate-800 backdrop-blur-md mb-6 overflow-hidden transition-all duration-300">
      
      {/* HEADER: TOGGLE SHOW/HIDE */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl transition-colors ${isOpen ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
            <BarChart3 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">Grafik Kepadatan Wadah Fisik (Storage Density)</h3>
              <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/50 border border-cyan-800/50 px-2 py-0.5 rounded-full">
                {totalLabPercentage}% Terisi
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isOpen ? 'Klik untuk melipat grafik kapasitas' : 'Buka untuk memantau grafik beban per zona rak & meja lab'}
            </p>
          </div>
        </div>
        
        <div className="text-slate-400 bg-slate-800 p-2 rounded-xl border border-slate-700/60 hover:text-white transition-colors">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* PANEL GRAFIK BATANG HORIZONTAL */}
      {isOpen && (
        <div className="p-4 sm:p-5 pt-2 border-t border-slate-800 animate-in fade-in duration-200">
          
          {/* Petunjuk Interaktif */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-cyan-400 shrink-0" />
              <span>Klik batang zona untuk langsung memfilter daftar barang di lokasi tersebut.</span>
            </div>
            <span className="font-mono text-slate-300 font-semibold hidden sm:inline">
              Beban Total: {totalLabUnits} / {totalMaxCapacity} Unit
            </span>
          </div>

          {/* Sumbu Skala Grafis (Axis Scale Guide) */}
          <div className="hidden sm:flex items-center justify-between text-[10px] font-mono text-slate-500 pl-48 pr-28 pb-1.5 border-b border-slate-800/40 select-none">
            <span>0</span>
            <span>5 Unit (25%)</span>
            <span>10 Unit (50%)</span>
            <span>15 Unit (75%)</span>
            <span className="text-rose-400 font-bold">20 Unit (Max Limit)</span>
          </div>

          {/* DAFTAR GRAFIK BATANG PER ZONA */}
          <div className="space-y-2 mt-2">
            {zones.map((zone) => {
              const count = getStorageDensity(zone.id);
              const percentage = Math.min(100, (count / maxCapacityPerZone) * 100);
              const isOverloaded = count >= maxCapacityPerZone;

              return (
                <div
                  key={zone.id}
                  onClick={() => onSelectLocation(zone.id)}
                  className="group p-2.5 sm:p-3 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                  title={`Klik untuk filter aset di ${zone.name}`}
                >
                  {/* Kolom 1: Label Zona & Deskripsi */}
                  <div className="w-full sm:w-44 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${zone.badgeColor}`}>
                        {zone.id}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                        {zone.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate font-sans">
                      {zone.category}
                    </p>
                  </div>

                  {/* Kolom 2: Grafik Batang Horizontal */}
                  <div className="flex-1 min-w-0">
                    <div className="w-full h-3.5 bg-slate-950/90 rounded-full overflow-hidden border border-slate-800 p-0.5 relative">
                      {/* Grid Line Marks di belakang bar */}
                      <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-20">
                        <div className="w-[1px] h-full bg-white" />
                        <div className="w-[1px] h-full bg-white" />
                        <div className="w-[1px] h-full bg-white" />
                        <div className="w-[1px] h-full bg-white" />
                      </div>

                      {/* Batang Terisi (Bar Chart) */}
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${
                          isOverloaded 
                            ? 'from-rose-600 to-rose-400 animate-pulse' 
                            : zone.barColor
                        }`}
                        style={{ width: `${count > 0 ? Math.max(5, percentage) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Kolom 3: Angka Kepadatan & Status */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 sm:w-28 text-right">
                    <span className="text-xs font-mono text-slate-300 font-semibold">
                      {count} <span className="text-slate-500 font-normal">/ {maxCapacityPerZone}</span>
                    </span>

                    <span className={`text-xs font-mono font-bold min-w-[36px] text-right ${
                      isOverloaded 
                        ? 'text-rose-400' 
                        : count > 0 
                          ? 'text-slate-200' 
                          : 'text-slate-500'
                    }`}>
                      {Math.round(percentage)}%
                    </span>

                    <span 
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isOverloaded
                          ? 'bg-rose-500 animate-ping'
                          : count > 0
                            ? 'bg-emerald-400'
                            : 'bg-slate-700'
                      }`} 
                      title={isOverloaded ? 'Zona Penuh (Overload)' : count > 0 ? 'Normal' : 'Kosong'}
                    />
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
};

export default RealityMap;