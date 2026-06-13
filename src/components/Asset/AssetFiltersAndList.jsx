import React from 'react';
import { Search, MapPin } from 'lucide-react';
import AssetCard from './AssetCard';

const AssetFiltersAndList = ({
  filterLayer,
  setFilterLayer,
  searchQuery,
  setSearchQuery,
  loading,
  filteredAssets,
  parseLocation,
  getAssetAge,
  deleteAsset,
  updateStatus,
  onEditClick // Fungsi pemicu mode edit dari induk diteruskan ke AssetCard
}) => {
  return (
    <>
      {/* FILTERS */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {['all', '1', '2', '3'].map((l) => (
          <button
            key={l}
            onClick={() => setFilterLayer(l)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
              filterLayer === l
                ? 'bg-cyan-600 border-cyan-500 text-white'
                : 'bg-white/5 border-transparent text-slate-500'
            }`}
          >
            {l === 'all' ? 'Semua' : `Layer ${l}`}
          </button>
        ))}
      </div>

      {/* SEARCH INPUT */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
        <input
          type="text"
          placeholder="Cari sensor, kode unit, atau alamat wadah (misal: TB-DAILY)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-cyan-500/50"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-wider text-cyan-500 hover:text-white"
          >
            Reset
          </button>
        )}
      </div>

      {/* LIST ASSETS */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-slate-600 animate-pulse text-xs">Menghubungkan ke database...</p>
        ) : filteredAssets.length === 0 ? (
          <p className="text-center text-slate-500 text-xs py-4">Tidak ada aset yang cocok dengan filter.</p>
        ) : (
          filteredAssets.map((asset) => {
            const locDetails = parseLocation(asset.lokasi_penyimpanan);

            return (
              <div key={asset.id} className="relative group">
                {/* Badge Alamat Fisik */}
                <div
                  className={`absolute -top-2 left-4 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[8px] font-black border tracking-wider uppercase bg-gradient-to-r ${locDetails.color}`}
                >
                  <MapPin size={8} />
                  <span>{locDetails.label}</span>
                  {locDetails.detail && <span className="opacity-50">| {locDetails.detail}</span>}
                </div>

                {/* AssetCard menerima properti onEditClick untuk merender tombol edit di dalam dirinya */}
                <AssetCard
                  asset={asset}
                  age={getAssetAge(asset.created_at)}
                  onDelete={deleteAsset}
                  onUpdateStatus={updateStatus}
                  onEditClick={onEditClick}
                />
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default AssetFiltersAndList;