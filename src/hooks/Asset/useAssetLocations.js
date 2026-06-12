import { useMemo } from 'react';

export const useAssetLocations = (assets = []) => {
  // Fungsi untuk menerjemahkan kode alamat menjadi teks informatif
  const parseLocation = (locString) => {
    if (!locString) return { type: 'UNKNOWN', label: 'Belum Diatur', detail: '' };
    
    const parts = locString.toUpperCase().split('-');
    
    // Skenario 1: Antarmuka Toolbox (e.g., TB-DAILY, TB-SOLDER)
    if (parts[0] === 'TB') {
      return {
        type: 'TOOLBOX',
        label: `Toolbox ${parts[1] || ''}`,
        detail: 'Zona Meja Solder / Eksekusi',
        color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400'
      };
    }
    
    // Skenario 2: Antarmuka Rak Kaca Matriks (e.g., RK2-TRA-04)
    if (parts[0] === 'RK1' || parts[0] === 'RK2') {
      const rakNo = parts[0] === 'RK1' ? '1 (Laptop)' : '2 (Sensor Matriks)';
      const tray = parts[1] ? `Nampan ${parts[1].replace('TR', '')}` : '';
      const cup = parts[2] ? `Cup #${parts[2]}` : '';
      
      return {
        type: 'RACK',
        label: `Rak Kaca ${rakNo}`,
        detail: `${tray} ${cup}`.trim(),
        color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400'
      };
    }
    
    // Default jika input bebas biasa
    return {
      type: 'OTHER',
      label: locString,
      detail: 'Lokasi Umum',
      color: 'from-slate-500/20 to-slate-700/10 border-white/10 text-slate-300'
    };
  };

  // Menghitung statistik kepadatan slot wadah
  const locationStats = useMemo(() => {
    const counts = {};
    assets.forEach(asset => {
      if (asset.lokasi_penyimpanan) {
        counts[asset.lokasi_penyimpanan] = (counts[asset.lokasi_penyimpanan] || 0) + 1;
      }
    });
    return counts;
  }, [assets]);

  return { parseLocation, locationStats };
};