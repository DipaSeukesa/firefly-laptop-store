# 📄 Dokumentasi Halaman: Assets (Gudang Aset & Reality Mapping)

- **Route**: `/assets`
- **File Sumber**: [`src/pages/Assets.jsx`](../../src/pages/Assets.jsx)
- **Komponen**: [`src/components/Asset/`](../../src/components/Asset/)
- **Custom Hook**: [`src/hooks/Asset/useAssetLocations.js`](../../src/hooks/Asset/useAssetLocations.js)
- **Akses**: Terproteksi ([`ProtectedRoute`](../../src/components/ProtectedRoute.jsx))
- **Tujuan**: Mengelola seluruh aset fisik di laboratorium dan gudang, mengelompokkan barang berdasarkan layer prioritas perputaran (L1, L2, L3), memetakan kapasitas wadah fisik (Reality Map), serta mendeteksi stok lama (>30 hari) atau unit rusak secara otomatis.

---

## 🧩 Komponen Utama (`src/components/Asset/`)

| Komponen | Path File | Peran Utama |
|---|---|---|
| `AssetStats` | [`AssetStats.jsx`](../../src/components/Asset/AssetStats.jsx) | Bilah kokpit terpadu (*Unified Cockpit Ribbon*) untuk metrik finansial (Modal Terikat & Target Margin) serta telemetri lab (Kesehatan Stok & Status Unit). |
| `RealityMap` | [`RealityMap.jsx`](../../src/components/Asset/RealityMap.jsx) | Grafik batang horizontal analitik (6 zona fisik: RK1-3 & MJ1-3) untuk memantau kapasitas & kepadatan beban slot secara presisi. |
| `AssetFiltersAndList` | [`AssetFiltersAndList.jsx`](../../src/components/Asset/AssetFiltersAndList.jsx) | Kolom kontrol terpadu: Tombol buka/tutup semua kategori (sebelah kiri), input pencarian (tengah), tombol popover sortir produk (sebelah kanan), tombol popover filter layer klasifikasi (sebelah kanan), serta daftar kartu barang per kategori. |
| `AssetCard` | [`AssetCard.jsx`](../../src/components/Asset/AssetCard.jsx) | Kartu aset model List-Detail horizontal ringkas: thumbnail foto resolusi tinggi yang dapat diklik untuk diperbesar (Lightbox Zoom), badge smart graphic hardware, kode unit, alamat lab, tombol `+` quick increment stok, dan drawer detail. |
| `AssetPhotoModal` | [`AssetPhotoModal.jsx`](../../src/components/Asset/AssetPhotoModal.jsx) | Modal pemilihan sumber foto produk interaktif: Ambil dari Kamera HP/Webcam langsung, Pilih File/Galeri, Tempel Link Gambar Web (dengan tombol Paste Clipboard), Pintas Google Images, dan Hapus Foto. |
| `AssetPhotoZoomModal` | [`AssetPhotoZoomModal.jsx`](../../src/components/Asset/AssetPhotoZoomModal.jsx) | Modal Lightbox pembesar foto produk resolusi tinggi (Full-Size Zoom) dengan navigasi keyboard Escape, pintas ganti foto, dan buka resolusi asli. |
| `AssetModal` | [`AssetModal.jsx`](../../src/components/Asset/AssetModal.jsx) | Komponen modal orkestrator yang mengoordinasikan sub-komponen form modular agar kode tetap rapi dan mudah dirawat. |
| ↳ `ModalVoiceAI` | [`modal/ModalVoiceAI.jsx`](../../src/components/Asset/modal/ModalVoiceAI.jsx) | Asisten suara continuous mic, input textarea auto-expanding dinamis (auto-height saat mengetik atau tekan Enter), eksekusi AI, dan panel review batch multi-item. |
| ↳ `ModalDuplicateAlert` | [`modal/ModalDuplicateAlert.jsx`](../../src/components/Asset/modal/ModalDuplicateAlert.jsx) | Banner deteksi duplikasi tipe/seri barang L2/L3 dengan tombol 1-klik tambah stok (`+Qty`). |
| ↳ `ModalPhotoSection` | [`modal/ModalPhotoSection.jsx`](../../src/components/Asset/modal/ModalPhotoSection.jsx) | Pengelola foto Cloudinary (`foto_aset_produk`, `firefly/asset`), preview thumbnail, tombol upload file, dan 1-klik pencarian Google Images. |
| ↳ `ModalSpecsEditor` | [`modal/ModalSpecsEditor.jsx`](../../src/components/Asset/modal/ModalSpecsEditor.jsx) | Editor spesifikasi teknis dinamis (kolom JSONB) dengan penambahan dan penghapusan key-value custom. |
| ↳ `ModalLocationGenerator` | [`modal/ModalLocationGenerator.jsx`](../../src/components/Asset/modal/ModalLocationGenerator.jsx) | Generator alamat fisik lab 3 langkah (Rak, Wadah, Cup) serta tombol akses cepat makro stasiun kerja. |
| `RealityInsight` | [`RealityInsight.jsx`](../../src/components/Asset/RealityInsight.jsx) | Evaluasi sistem & tombol salin ringkasan konteks inventaris (JSON format) untuk asisten AI. |

---

## 🤖 Integrasi Asisten Suara & Gemini AI (`src/lib/gemini.js`)
- **Speech-to-Text Continuous (VTT Gboard Style)**:
  - Mengaktifkan `recognition.continuous = true` dengan penanganan auto-resume dan pengabaian error hening sementara (`no-speech`).
  - Mikrofon tidak akan menutup saat teknisi mengambil jeda bicara atau membaca label part.
- **Gemini AI Multi-Item Batch & Estimasi Cerdas**:
  - **Batch Multi-Item**: Mampu mengekstrak puluhan barang sekaligus dalam satu kalimat ucapan (contoh: 28 adaptor charger).
  - **Panel Review Batch**: Menampilkan kartu per item dengan rincian modal, target jual (+25%), lokasi lab, dan spesifikasi jack/voltase.
  - **1-Click Batch Save**: Tombol submit utama mendeteksi batch otomatis (*"Simpan Semua (N) Produk Sekaligus ke Gudang"*) untuk menyimpan seluruh item terdeteksi sekaligus ke database Supabase.
  - **Estimasi Modal E-Commerce ID**: Mencari estimasi modal pasaran di Tokopedia/Shopee jika teknisi tidak menyebutkan modal.
  - **Target Jual ~25%**: Menghitung otomatis target harga jual dengan margin laba 25% (dibulatkan rapi ke kelipatan Rp 5.000).

---

## 🏗️ Klasifikasi Layer Aset (L1, L2, L3)

1. **L1: Utama (Dagangan Cepat)**:
   - Laptop second siap jual, smartphone, part premium bernilai tinggi.
   - Format Kode Unit otomatis: `L-001`, `L-002`, dst.
   - Memiliki target harga jual dan kalkulasi potensi margin keuntungan.
2. **L2: Medium (Stok Lab & R&D)**:
   - Komponen mikrokontroler, modul sensor, charger/adaptor, IC, suku cadang.
   - Format Kode Unit otomatis berbasis alamat cup: `SN-[KODE_CUP]` (e.g. `SN-CA10`).
3. **L3: Rendah (Infrastruktur Kerja / Tools)**:
   - Stasiun solder, obeng, tang, timah, multitester.
   - Tidak memerlukan kode serial unit untuk efisiensi operasional.

---

## 🗺️ Zona Fisik Reality Map

- **RK1**: Rak Kaca 1 (Laptop dagangan, HP, sparepart premium P1)
- **RK2**: Rak Kaca 2 (Wadah induk box donat, komponen mikro & sensor P2)
- **RK3**: Rak Terbuka (Box besar, stok kabel, material mentah, casing)
- **MJ1**: Meja 1 (Stasiun solder, timah, toolbox alat kerja utama P3)
- **MJ2**: Meja 2 (Area pembongkaran, toolset obeng, part servis)
- **MJ3**: Meja 3 (PC programming, ST-Link, 3D printer, modul IoT transit)

---

## 💾 Struktur Tabel Database (`assets`)

```sql
CREATE TABLE public.assets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama_barang TEXT NOT NULL,
  kategori_layer INT NOT NULL, -- 1 = L1, 2 = L2, 3 = L3
  kategori_barang TEXT,        -- e.g. 'Laptop Second', 'Sensor', 'Charger & Adaptor'
  kode_unit TEXT,              -- e.g. 'L-001' atau 'SN-CA10'
  qty INT DEFAULT 1,
  kondisi TEXT DEFAULT 'Bagus',-- 'Bagus', 'Rusak', 'Butuh Servis', 'Suku Cadang'
  status_barang TEXT DEFAULT 'Tersedia', -- 'Tersedia', 'Servis', 'Digunakan', 'Habis'
  harga_modal NUMERIC DEFAULT 0,
  harga_jual_target NUMERIC DEFAULT 0,
  lokasi_penyimpanan TEXT,     -- e.g. 'RK2-BX1-CA10'
  catatan_teknis TEXT,
  spesifikasi JSONB DEFAULT '{}'::jsonb, -- Kolom JSONB fleksibel untuk spek teknis
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index GIN untuk pencarian query JSONB spesifikasi cepat
CREATE INDEX IF NOT EXISTS idx_assets_spesifikasi ON public.assets USING gin (spesifikasi);
```

---

## 📦 Logika Penggabungan Stok (Smart Stock Increment) vs Laptop Bekas

Sistem membedakan perilaku penambahan barang berdasarkan sifat aset fisik:

1. **Komponen & Tools (Layer 2 & Layer 3 — Komoditas Fungibel)**:
   - Barang seperti charger (e.g., `ADLX90NCC2A`), resistor, sensor IC, atau kabel memiliki spesifikasi identik dalam jumlah banyak.
   - **Pada Input AI / Batch Voice**: Sistem secara otomatis mengecek apakah nama barang atau part number sudah ada di database. Jika sudah ada, sistem **menambahkan `qty`** pada barang eksisting alih-alih membuat baris duplikat.
   - **Pada Input Form Modal**: Muncul notifikasi cerdas (*Duplicate Match Banner*) berwarna amber: *"Barang dengan tipe/seri ini sudah ada di gudang. Klik tombol untuk langsung menambah stok (+Qty)"*.
   - **Pada Kartu Aset**: Terdapat tombol cepat `+` di samping angka Qty untuk menambah stok barang langsung dari tampilan daftar tanpa perlu membuka modal form.

2. **Laptop Bekas & Gadget Bernilai Tinggi (Layer 1 — Non-Fungibel)**:
   - **DILARANG DIGABUNG (Strict Isolation)**: Setiap unit laptop second memiliki nomor seri fisik (SN/Serial Number), nomor KTP unit (`L-001`, `L-002`), kondisi baterai, kosmetik bodi, kelengkapan, dan riwayat servis yang berbeda.
   - Sistem mewajibkan setiap laptop tercatat sebagai baris tersendiri agar riwayat modal dan margin per unit tetap akurat.

---

## 🖼️ Tampilan List-Detail & Pengelolaan Foto Tanpa Reload

1. **Desain Kartu List-Detail (Dense & Space-Saving)**:
   - Mengubah tampilan kartu vertikal menjadi susunan horizontal yang ramping dan hemat ruang vertikal.
   - Thumbnail foto produk di sebelah kiri (dengan fallback Smart Hardware Graphic Badge beraksen warna brand, watt, voltase, dan ukuran jack).
   - Chip badge status, nama barang, kode unit, dan atribut spesifikasi kunci tampil rapat dan mudah dibaca.
   - Metrik modal & margin serta tombol aksi tersusun rapi di sebelah kanan.

2. **Pembaruan Foto Real-Time Tanpa Reload Halaman (Optimistic Update)**:
   - Saat link foto diisi atau diubah, state React diperbarui seketika (`setAssets`). Foto langsung berganti di layar dalam hitungan milidetik tanpa trigger loading spinner, tanpa kedipan (flicker), dan tanpa mereset posisi scroll layar.
   - Perubahan data ke database Supabase berjalan secara hening (*silent background update*).

3. **Pembersihan Otomatis Link Foto Rusak / Mati**:
   - Jika suatu URL foto menghasilkan error 404, 403 (hotlink forbidden), atau mati (`onError` event), sistem secara otomatis menghapus nilai `foto_url` dari database Supabase (`foto_url = null`).
   - Kartu aset langsung kembali menampilkan Smart Graphic Badge dengan aman tanpa menyisakan link rusak atau membebani koneksi jaringan di masa mendatang.

4. **Modal Pilihan Sumber Foto Lengkap ([`AssetPhotoModal.jsx`](../../src/components/Asset/AssetPhotoModal.jsx))**:
   - Klik pada logo kamera memunculkan modal responsif dengan opsi:
     - 📸 **Ambil dari Kamera Langsung**: Membuka kamera HP atau webcam laptop via `getUserMedia` dengan preview streaming & tombol jepret foto.
     - 📁 **Pilih dari File / Galeri**: Memilih gambar dari media penyimpanan perangkat dan otomatis upload ke Cloudinary.
     - 🔗 **Tempel Link Web / Google Images**: Input URL instan disertai tombol "Paste" clipboard.
     - 🔍 **Cari di Google Images**: Tautan pintas 1-klik untuk mencari foto barang di Google Images pada tab baru.
     - 🗑️ **Hapus Foto**: Mengembalikan tampilan unit ke Smart Graphic Badge.

5. **Lightbox Pembesar Foto Produk ([`AssetPhotoZoomModal.jsx`](../../src/components/Asset/AssetPhotoZoomModal.jsx))**:
   - Mengklik thumbnail foto produk akan langsung membuka Lightbox Zoom resolusi tinggi di tengah layar.
   - Layar belakang menggelap dengan efek `backdrop-blur-xl`.
   - Dapat ditutup dengan tombol `Esc` atau klik di area luar gambar.

6. **Kontrol Header & Sortir Produk Per Kategori ([`AssetFiltersAndList.jsx`](../../src/components/Asset/AssetFiltersAndList.jsx))**:
   - **Sebelah Kiri Pencarian**: Tombol ikon Buka / Tutup Semua Kategori (`FolderOpen` / `FolderArchive`).
   - **Tengah**: Kolom input pencarian cepat.
   - **Sebelah Kanan Pencarian**:
     - **Ikon Sortir Produk** (`ArrowUpDown`): Mengurutkan barang di setiap kategori (Terbaru, Nama A-Z, Nama Z-A, Modal Tertinggi/Terendah, Margin Tertinggi, Qty Terbanyak).
     - **Ikon Filter Klasifikasi** (`SlidersHorizontal`): Memfilter barang berdasarkan Layer (Semua, L1, L2, L3).

