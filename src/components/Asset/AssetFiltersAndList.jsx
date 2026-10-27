import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
    Search, Folder, ChevronDown, ChevronUp, SlidersHorizontal, 
    FolderOpen, FolderArchive, Check, PackageSearch, Laptop, Cpu, Wrench, Layers,
    ArrowUpDown, ArrowDownAZ, ArrowUpAZ, Calendar, DollarSign, Sparkles
} from 'lucide-react';
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
    onEditClick,
    onIncrementStock,
    onUpdatePhoto
}) => {
    // State kategori tersimpan (true = collapsed/tertutup)
    const [collapsedCategories, setCollapsedCategories] = useState({});
    
    // State untuk popover filter klasifikasi
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const filterMenuRef = useRef(null);

    // State untuk popover sortir produk
    const [sortBy, setSortBy] = useState('newest');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const sortMenuRef = useRef(null);

    // LOGIKA GROUPING: Mengelompokkan data berdasarkan kategori & Mengurutkan produk di dalamnya
    const groupedAssets = useMemo(() => {
        const groups = {};

        filteredAssets.forEach((asset) => {
            const categoryName = asset.kategori_barang?.trim() || 'Tanpa Kategori';

            if (!groups[categoryName]) {
                groups[categoryName] = {
                    items: [],
                    totalCost: 0,
                    totalUnits: 0
                };
            }

            groups[categoryName].items.push(asset);
            const cost = (Number(asset.harga_modal) || 0) * (asset.qty || 1);
            groups[categoryName].totalCost += cost;
            groups[categoryName].totalUnits += (asset.qty || 1);
        });

        // Urutkan item di setiap kategori sesuai opsi sortir aktif
        Object.keys(groups).forEach((cat) => {
            groups[cat].items.sort((a, b) => {
                switch (sortBy) {
                    case 'name_asc':
                        return (a.nama_barang || '').localeCompare(b.nama_barang || '', undefined, { numeric: true, sensitivity: 'base' });
                    case 'name_desc':
                        return (b.nama_barang || '').localeCompare(a.nama_barang || '', undefined, { numeric: true, sensitivity: 'base' });
                    case 'modal_desc':
                        return (Number(b.harga_modal) || 0) - (Number(a.harga_modal) || 0);
                    case 'modal_asc':
                        return (Number(a.harga_modal) || 0) - (Number(b.harga_modal) || 0);
                    case 'margin_desc': {
                        const marginA = ((Number(a.harga_jual_target) || 0) - (Number(a.harga_modal) || 0));
                        const marginB = ((Number(b.harga_jual_target) || 0) - (Number(b.harga_modal) || 0));
                        return marginB - marginA;
                    }
                    case 'qty_desc':
                        return (Number(b.qty) || 1) - (Number(a.qty) || 1);
                    case 'oldest':
                        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
                    case 'newest':
                    default:
                        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
                }
            });
        });

        return groups;
    }, [filteredAssets, sortBy]);

    // EFECT PINTAR: Jika ada pencarian aktif, otomatis BUKA semua kategori agar hasil langsung terlihat!
    useEffect(() => {
        if (searchQuery.trim() !== '') {
            const allOpenState = {};
            Object.keys(groupedAssets).forEach((cat) => {
                allOpenState[cat] = false; // false = terbuka
            });
            setCollapsedCategories(allOpenState);
        }
    }, [searchQuery, groupedAssets]);

    // Inisialisasi awal: Default dibuka kategori pertama atau semua tertutup rapi
    useEffect(() => {
        if (Object.keys(groupedAssets).length > 0 && Object.keys(collapsedCategories).length === 0) {
            const defaultState = {};
            const keys = Object.keys(groupedAssets);
            keys.forEach((cat, idx) => {
                defaultState[cat] = idx === 0 ? false : true;
            });
            setCollapsedCategories(defaultState);
        }
    }, [groupedAssets]);

    // Menutup menu filter & menu sortir saat klik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                setShowFilterMenu(false);
            }
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
                setShowSortMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fungsi toggle buka/tutup satu kategori
    const toggleCategory = (categoryName) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [categoryName]: !prev[categoryName]
        }));
    };

    // Fungsi Buka Semua / Tutup Semua
    const toggleAllCategories = (open) => {
        const newState = {};
        Object.keys(groupedAssets).forEach(cat => {
            newState[cat] = !open;
        });
        setCollapsedCategories(newState);
    };

    const allCategoriesCollapsed = useMemo(() => {
        const keys = Object.keys(groupedAssets);
        if (keys.length === 0) return true;
        return keys.every(cat => collapsedCategories[cat] === true);
    }, [groupedAssets, collapsedCategories]);

    const filterOptions = [
        {
            id: 'all',
            label: 'Semua Stok',
            desc: 'Tampilkan semua layer aset',
            icon: Layers,
            color: 'text-slate-300'
        },
        {
            id: '1',
            label: 'L1: Utama',
            desc: 'Laptop & Gadget (Jual Cepat)',
            icon: Laptop,
            color: 'text-cyan-400'
        },
        {
            id: '2',
            label: 'L2: Stok',
            desc: 'Komponen Mikro & Sensor Lab',
            icon: Cpu,
            color: 'text-blue-400'
        },
        {
            id: '3',
            label: 'L3: Tools',
            desc: 'Alat Kerja, Solder & Toolbox',
            icon: Wrench,
            color: 'text-purple-400'
        },
    ];

    const sortOptions = [
        { id: 'newest', label: 'Terbaru Ditambahkan', desc: 'Urutan input terbaru di awal', icon: Calendar },
        { id: 'name_asc', label: 'Nama Barang (A - Z)', desc: 'Urutan abjad nama A ke Z', icon: ArrowDownAZ },
        { id: 'name_desc', label: 'Nama Barang (Z - A)', desc: 'Urutan abjad nama Z ke A', icon: ArrowUpAZ },
        { id: 'modal_desc', label: 'Modal Tertinggi', desc: 'Harga modal terbesar ke terkecil', icon: DollarSign },
        { id: 'modal_asc', label: 'Modal Terendah', desc: 'Harga modal terkecil ke terbesar', icon: DollarSign },
        { id: 'margin_desc', label: 'Potensi Margin Terbesar', desc: 'Margin keuntungan tertinggi', icon: Sparkles },
        { id: 'qty_desc', label: 'Stok Terbanyak (Qty)', desc: 'Jumlah unit terbanyak', icon: PackageSearch },
    ];

    return (
        <div className="space-y-5 mb-8">
            
            {/* BARIS KONTROL HEADER: 
                [TUTUP/BUKA SEMUA KATEGORI (KIRI)] 
                + [PENCARIAN BOX (TENGAH)] 
                + [SORTIR PRODUK (KANAN)] 
                + [FILTER LAYER (KANAN)] 
            */}
            <div className="flex items-center gap-2 relative">
                
                {/* 1. TOMBOL BUKA / TUTUP SEMUA KATEGORI (DI SEBELAH KIRI PENCARIAN BOX) */}
                <button
                    onClick={() => toggleAllCategories(allCategoriesCollapsed)}
                    className="w-11 h-11 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0 shadow-sm cursor-pointer"
                    title={allCategoriesCollapsed ? "Buka Semua Kategori" : "Tutup Semua Kategori"}
                    aria-label={allCategoriesCollapsed ? "Buka Semua Kategori" : "Tutup Semua Kategori"}
                >
                    {allCategoriesCollapsed ? (
                        <FolderOpen size={18} className="text-cyan-400" />
                    ) : (
                        <FolderArchive size={18} className="text-slate-400" />
                    )}
                </button>

                {/* 2. KOLOM PENCARIAN BOX (TENGAH) */}
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" size={17} />
                    <input
                        type="text"
                        placeholder="Cari barang, kode unit (#L-001), lokasi (RK2), kategori..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl py-3 pl-11 pr-14 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-white placeholder-slate-500 transition-all shadow-inner"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-cyan-400 hover:text-white px-2 py-1 rounded bg-slate-800 transition-colors cursor-pointer"
                        >
                            Reset
                        </button>
                    )}
                </div>

                {/* 3. TOMBOL SHORTIR PRODUK ASET (DI SEBELAH KANAN PENCARIAN BOX - IKON ONLY) */}
                <div className="relative" ref={sortMenuRef}>
                    <button
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all duration-200 relative shrink-0 cursor-pointer ${
                            sortBy !== 'newest'
                                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500/30'
                                : showSortMenu
                                    ? 'bg-slate-800 border-slate-700 text-white'
                                    : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title="Urutkan / Sortir Produk di Setiap Kategori"
                        aria-label="Sortir Produk"
                    >
                        <ArrowUpDown size={18} />
                        {/* Dot indicator jika sortir bukan default */}
                        {sortBy !== 'newest' && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                    </button>

                    {/* Popover Menu Pilihan Sortir */}
                    {showSortMenu && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                            <div className="px-3 py-2 border-b border-slate-800/80 mb-1 flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Urutkan Produk Aset
                                </span>
                                {sortBy !== 'newest' && (
                                    <button
                                        onClick={() => { setSortBy('newest'); setShowSortMenu(false); }}
                                        className="text-[10px] text-cyan-400 hover:underline font-bold cursor-pointer"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                            <div className="space-y-1">
                                {sortOptions.map((opt) => {
                                    const Icon = opt.icon;
                                    const isSelected = sortBy === opt.id;

                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => {
                                                setSortBy(opt.id);
                                                setShowSortMenu(false);
                                            }}
                                            className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                                                isSelected
                                                    ? 'bg-cyan-500/15 text-white border border-cyan-500/30'
                                                    : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                                                    <Icon size={14} />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-xs font-bold block truncate">
                                                        {opt.label}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 block truncate">
                                                        {opt.desc}
                                                    </span>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <Check size={14} className="text-cyan-400 shrink-0 ml-2" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. TOMBOL FILTER KLASIFIKASI LAYER (DI SEBELAH KANAN) */}
                <div className="relative" ref={filterMenuRef}>
                    <button
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all duration-200 relative shrink-0 cursor-pointer ${
                            filterLayer !== 'all'
                                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500/30'
                                : showFilterMenu
                                    ? 'bg-slate-800 border-slate-700 text-white'
                                    : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title="Filter Klasifikasi Layer (L1 / L2 / L3)"
                        aria-label="Filter Klasifikasi"
                    >
                        <SlidersHorizontal size={18} />
                        {/* Dot indicator jika filter layer aktif */}
                        {filterLayer !== 'all' && (
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                    </button>

                    {/* Popover Menu Pilihan Layer */}
                    {showFilterMenu && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                            <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Klasifikasi Layer Aset
                                </span>
                            </div>
                            <div className="space-y-1">
                                {filterOptions.map((opt) => {
                                    const Icon = opt.icon;
                                    const isSelected = filterLayer === opt.id;

                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => {
                                                setFilterLayer(opt.id);
                                                setShowFilterMenu(false);
                                            }}
                                            className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer ${
                                                isSelected
                                                    ? 'bg-cyan-500/15 text-white border border-cyan-500/30'
                                                    : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className={`p-1.5 rounded-lg bg-slate-800 ${opt.color}`}>
                                                    <Icon size={15} />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-xs font-bold block truncate">
                                                        {opt.label}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 block truncate">
                                                        {opt.desc}
                                                    </span>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <Check size={14} className="text-cyan-400 shrink-0 ml-2" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* DAFTAR ASET (GROUPED BY CATEGORY) */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 bg-slate-900/30 rounded-3xl border border-slate-800/50">
                        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm text-slate-400 font-medium">Memuat inventaris dari database...</p>
                    </div>
                ) : filteredAssets.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                        <PackageSearch size={36} className="mx-auto text-slate-600 mb-3" />
                        <h4 className="text-base font-bold text-slate-300 mb-1">Aset Tidak Ditemukan</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                            Tidak ada barang yang cocok dengan kata kunci "{searchQuery}" atau filter layer yang dipilih.
                        </p>
                        {(searchQuery || filterLayer !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterLayer('all');
                                }}
                                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all"
                            >
                                Reset Semua Filter
                            </button>
                        )}
                    </div>
                ) : (
                    Object.entries(groupedAssets).map(([category, groupData]) => {
                        const isCollapsed = collapsedCategories[category] === true;

                        return (
                            <div 
                                key={category} 
                                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-200"
                            >
                                {/* HEADER KATEGORI */}
                                <div
                                    onClick={() => toggleCategory(category)}
                                    className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer select-none bg-slate-900/70 hover:bg-slate-800/60 transition-colors border-b border-slate-800/60"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                                            <Folder size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                                                    {category}
                                                </h4>
                                                <span className="text-xs font-mono font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 shrink-0">
                                                    {groupData.items.length} item ({groupData.totalUnits} unit)
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Valuasi Kategori & Tombol Toggle */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Valuasi</span>
                                            <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400">
                                                Rp {groupData.totalCost.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors">
                                            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                                        </div>
                                    </div>
                                </div>

                                {/* PANEL DAFTAR KARTU ASET DALAM KATEGORI */}
                                {!isCollapsed && (
                                    <div className="p-3.5 sm:p-4 animate-in fade-in duration-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                            {groupData.items.map((asset) => {
                                                const locDetails = parseLocation(asset.lokasi_penyimpanan);

                                                return (
                                                    <AssetCard
                                                        key={asset.id}
                                                        asset={asset}
                                                        age={getAssetAge(asset.created_at)}
                                                        onDelete={deleteAsset}
                                                        onUpdateStatus={updateStatus}
                                                        onEditClick={onEditClick}
                                                        locDetails={locDetails}
                                                        onIncrementStock={onIncrementStock}
                                                        onUpdatePhoto={onUpdatePhoto}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                            </div>
                        );
                    })
                )}
            </div>

        </div>
    );
};

export default AssetFiltersAndList;