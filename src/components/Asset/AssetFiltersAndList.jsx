import React, { useMemo, useState, useEffect } from 'react';
import { Search, MapPin, Folder, ChevronDown, ChevronUp } from 'lucide-react';
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
    onEditClick
}) => {
    // STATE KATEGORI: Kita ubah mekanisme default-nya di bawah
    const [collapsedCategories, setCollapsedCategories] = useState({});

    // LOGIKA GROUPING: Mengelompokkan data berdasarkan kategori
    const groupedAssets = useMemo(() => {
        const groups = {};

        filteredAssets.forEach((asset) => {
            const categoryName = asset.kategori_barang?.trim() || 'Tanpa Kategori';

            if (!groups[categoryName]) {
                groups[categoryName] = {
                    items: [],
                    totalCost: 0
                };
            }

            groups[categoryName].items.push(asset);
            groups[categoryName].totalCost += (Number(asset.harga_modal) || 0) * (asset.qty || 1);
        });

        return groups;
    }, [filteredAssets]);

    // EFFECT UTAMA: Membuat semua kategori otomatis "HIDE" (true) saat pertama kali data dimuat
    useEffect(() => {
        if (Object.keys(groupedAssets).length > 0) {
            const defaultHiddenState = {};
            Object.keys(groupedAssets).forEach((category) => {
                // Set true agar default-nya tersembunyi/terlipat
                defaultHiddenState[category] = true;
            });
            setCollapsedCategories(defaultHiddenState);
        }
    }, [filteredAssets.length]); // Hanya pemicu ulang jika jumlah aset berubah / inisialisasi awal

    // Fungsi toggle buka/tutup
    const toggleCategory = (categoryName) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [categoryName]: !prev[categoryName]
        }));
    };

    return (
        <>
            {/* FILTER BUTTONS LAYER (CENTERED & 100% FILL PARENT - NO SCROLL) */}
            <div className="mb-5 w-full">
                <div className="grid grid-cols-4 gap-1.5 w-full">
                    {[
                        {
                            id: 'all',
                            label: 'Semua',
                            desc: 'Semua Stok',
                            example: 'Spektrum',
                            activeBg: 'bg-slate-800 border-slate-600 text-white shadow-md'
                        },
                        {
                            id: '1',
                            label: 'L1: Utama',
                            desc: 'Jual Cepat',
                            example: 'Laptop, HP',
                            activeBg: 'bg-gradient-to-b from-cyan-950/80 to-slate-900 border-cyan-500 text-cyan-400 shadow-md shadow-cyan-950/40'
                        },
                        {
                            id: '2',
                            label: 'L2: Medium',
                            desc: 'Komponen',
                            example: 'Box, Sensor',
                            activeBg: 'bg-gradient-to-b from-blue-950/80 to-slate-900 border-blue-500 text-blue-400 shadow-md shadow-blue-950/40'
                        },
                        {
                            id: '3',
                            label: 'L3: Rendah',
                            desc: 'Internal',
                            example: 'Alat, Solder',
                            activeBg: 'bg-gradient-to-b from-purple-950/80 to-slate-900 border-purple-500 text-purple-400 shadow-md shadow-purple-950/40'
                        },
                    ].map((l) => {
                        const isActive = filterLayer === l.id;

                        return (
                            <button
                                key={l.id}
                                onClick={() => setFilterLayer(l.id)}
                                className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center w-full transition-all duration-150 ${isActive
                                        ? `${l.activeBg} scale-[0.97]`
                                        : `bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/10`
                                    }`}
                            >
                                {/* Baris Atas: Label Layer */}
                                <span className="text-[9px] font-black uppercase tracking-tight block text-center truncate w-full">
                                    {l.label}
                                </span>

                                {/* Baris Tengah: Deskripsi Fungsi */}
                                <span className={`text-[8px] font-bold block mt-0.5 uppercase tracking-tighter text-center truncate w-full ${isActive ? 'text-white' : 'text-slate-500'
                                    }`}>
                                    {l.desc}
                                </span>

                                {/* Baris Bawah: Contoh Barang */}
                                <span className="text-[7px] font-medium text-slate-500 block text-center truncate w-full mt-0.5">
                                    {l.example}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* TEXTBOX PENCARIAN */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input
                    type="text"
                    placeholder="Cari sensor, kode unit, kategori atau deskripsi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-cyan-500/50 text-white"
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

            {/* RENDER UTAMA LIST ASSETS */}
            <div className="space-y-6">
                {loading ? (
                    <p className="text-center text-slate-600 animate-pulse text-xs">Menghubungkan ke database...</p>
                ) : filteredAssets.length === 0 ? (
                    <p className="text-center text-slate-500 text-xs py-4">Tidak ada aset yang cocok dengan filter atau pencarian.</p>
                ) : (
                    Object.entries(groupedAssets).map(([category, groupData]) => {
                        // Jika status kategori di state tidak ada atau bernilai true, maka dia HIDE
                        const isCollapsed = collapsedCategories[category] !== false;

                        return (
                            <div key={category} className="space-y-4">

                                {/* HEADER PEMBUNGKUS KATEGORI */}
                                <div
                                    onClick={() => toggleCategory(category)}
                                    className="flex items-center justify-between border-b border-white/5 pb-2 px-1 cursor-pointer select-none group/header"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 rounded-md bg-white/5 border border-white/5 text-cyan-400 group-hover/header:bg-cyan-500/10 transition-colors">
                                            <Folder size={12} />
                                        </div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 group-hover/header:text-white transition-colors flex items-center gap-1.5">
                                            {category}
                                            <span className="text-[10px] font-mono text-slate-500 font-normal">({groupData.items.length})</span>

                                            <span className="text-slate-500 group-hover/header:text-cyan-400 transition-colors">
                                                {isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                                            </span>
                                        </h4>
                                    </div>

                                    {/* TOTAL VALUASI HARGA PER KATEGORI */}
                                    <div className="text-right">
                                        <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold block">Total Valuasi</span>
                                        <span className="text-xs font-mono font-bold text-emerald-400">
                                            Rp {groupData.totalCost.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>

                                {/* ANIMASI PANEL TRANSISI HIDE / SHOW */}
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[5000px] opacity-100'
                                    }`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
                                        {groupData.items.map((asset) => {
                                            const locDetails = parseLocation(asset.lokasi_penyimpanan);

                                            return (
                                                <div key={asset.id} className="relative group pt-2">
                                                    {/* Badge Alamat Fisik */}
                                                    <div
                                                        className={`absolute -top-1 left-4 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[8px] font-black border tracking-wider uppercase bg-gradient-to-r ${locDetails.color}`}
                                                    >
                                                        <MapPin size={8} />
                                                        <span>{locDetails.label}</span>
                                                        {locDetails.detail && <span className="opacity-50">| {locDetails.detail}</span>}
                                                    </div>

                                                    <AssetCard
                                                        asset={asset}
                                                        age={getAssetAge(asset.created_at)}
                                                        onDelete={deleteAsset}
                                                        onUpdateStatus={updateStatus}
                                                        onEditClick={onEditClick}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
};

export default AssetFiltersAndList;