# 🤖 AGENTS.md — Panduan Standar untuk AI Agent & Pengembang

Selamat datang di repositori **Firefly Laptop Store & Reality Lab System**. Dokumen ini wajib dibaca dan ditaati oleh semua AI Agent (Antigravity, Cursor, Gemini, Claude, dll.) serta pengembang sebelum melakukan analisis, modifikasi, atau penambahan kode di repositori ini.

---

## 1. 📌 Ikhtisar Proyek

- **Nama Proyek**: Firefly Laptop Store & Reality Lab System
- **Tujuan Utama**: 
  1. **Katalog Publik (`/`)**: Etalase laptop dagangan responsif untuk calon pembeli dengan pemesanan langsung via WhatsApp.
  2. **Admin Suite (`/admin/*`)**: Pengelolaan inventaris laptop dan konfigurasi toko.
  3. **Reality Lab & Gudang Aset (`/assets`)**: Manajemen stok fisik multi-layer (L1 Laptop, L2 Sensor/Komponen, L3 Tools), pemetaan kepadatan wadah fisik 6 zona (RK1-3, MJ1-3), dan generator alamat matriks lab.
  4. **Keuangan & Kas (`/finance`)**: Pencatatan arus kas, multi-dompet (bank/cash), dan margin penjualan.
  5. **Tugas & Aktivitas (`/todo`)**: Manajemen agenda harian dan sub-tugas hirarkis.
  6. **Visi & Target (`/goals`)**: Pelacakan target tabungan dan ekspansi bisnis.
  7. **Log Kerja (`/logs`)**: Stopwatch timer sesi kerja teknisi dan evaluasi harian.
  8. **PC Builder (`/builder`)**: Simulator rakit PC desktop dengan validasi kompatibilitas part.

---

## 2. 🛠️ Tech Stack & Ekosistem

- **Frontend Core**: React 18.2, React Router DOM 6.30, Vite 5.0
- **Styling**: Tailwind CSS 3.3, Vanilla CSS, Glassmorphism Dark Mode
- **Icons**: `lucide-react`
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Supabase Realtime Channels)
- **Eksport Gambar**: `html2canvas`
- **Server Lokal**: `npm run dev` (Port default 5173 / 5174)

---

## 3. 📂 Struktur Direktori Proyek

```text
firefly-laptop-store/
├── AGENTS.md                   # Panduan utama untuk agen AI (file ini)
├── agen.md                     # Alias panduan agen (bahasa Indonesia)
├── docs/                       # Dokumentasi lengkap sistem
│   ├── README.md               # Indeks master dokumentasi
│   └── pages/                  # Dokumentasi per halaman aplikasi
│       ├── 01-home.md
│       ├── 02-admin-login.md
│       ├── 03-admin-dashboard.md
│       ├── 04-finance.md
│       ├── 05-todo.md
│       ├── 06-assets.md
│       ├── 07-goals.md
│       ├── 08-daily-logs.md
│       └── 09-pc-builder.md
├── src/
│   ├── App.jsx                 # Routing utama aplikasi
│   ├── main.jsx                # Entry point React
│   ├── index.css               # Styling global Tailwind
│   ├── pages/                  # Komponen halaman (Routes)
│   ├── components/             # Komponen modular per domain
│   │   ├── Asset/              # Komponen Gudang Aset & Reality Map
│   │   ├── finance/            # Komponen Pembukuan Keuangan
│   │   ├── Goals/              # Komponen Target Visi
│   │   ├── DailyLogs/          # Komponen Timer & Log Harian
│   │   ├── PCBuilder/          # Komponen Simulator Rakit PC
│   │   └── ProtectedRoute.jsx  # Wrapper proteksi login Supabase Auth
│   ├── hooks/                  # Custom React Hooks (e.g. useAssetLocations.js)
│   └── lib/                    # Supabase Client (`supabase.js`)
├── .gitignore                  # Aturan file yang tidak dilacak Git
├── .env.example                # Template konfigurasi tanpa data rahasia
└── package.json                # Dependensi & skrip proyek
```

---

## 4. 🛡️ Aturan Emas bagi Agen AI (Mandatory Guidelines)

### A. Keamanan Kredensial & Lingkungan (CRITICAL)
1. **Dilarang Keras Mengunggah `.env`**: File `.env` berisi URL dan Anonymous Key Supabase. Pastikan `.env` selalu ada di dalam `.gitignore` dan tidak pernah dimasukkan ke dalam commit git.
2. Jika ada variabel baru, tambahkan contoh formatnya ke file [`.env.example`](./.env.example).

### B. Standar Estetika & Keterbacaan Antarmuka (UI/UX)
1. **Hindari Font Mikro**: Dilarang menggunakan ukuran font yang tidak terbaca (seperti `text-[7px]` atau `text-[8px]`). Gunakan ukuran minimal:
   - Metadata / Badge: `text-xs` (12px) atau `text-[10px]` dengan font tebal (`font-bold`).
   - Konten & Label: `text-xs` hingga `text-sm` (13px–14px).
   - Judul & Nilai Finansial: `text-base` hingga `text-xl` (16px–20px) dengan `font-mono font-bold`.
2. **Kontras & Palet Warna**:
   - Latar belakang: `bg-slate-950` atau `bg-slate-900`.
   - Kartu & Wadah: `bg-slate-900/80` dengan border halus `border-slate-800`.
   - Aksen Aksi: Cyan (`text-cyan-400`, `bg-cyan-500`), Emerald untuk profit/uang masuk, Rose untuk servis/peringatan.
3. **Aksesibilitas Sentuh (Touchscreen Friendly)**:
   - Tombol-tombol aksi (Edit, Hapus, Expand, Filter) harus selalu terlihat atau memiliki kontras jelas, jangan menyembunyikannya hanya pada status *hover mouse*, agar pengguna HP/tablet dapat menggunakannya dengan nyaman.

### C. Integritas Skema Database Supabase
1. Selalu pertahankan nama kolom tabel yang ada (`nama_barang`, `kategori_layer`, `harga_modal`, `lokasi_penyimpanan`, `qty`, dll.).
2. Saat melakukan query update atau insert, pastikan tipe data sesuai (contoh: angka modal harus di-parse sebagai `Number(val) || 0`, `qty` minimal 1).

### D. Verifikasi Build & Pengujian
1. Setiap kali selesai mengubah kode komponen atau halaman, **wajib menjalankan validasi build**:
   ```bash
   npm run build
   ```
   Pastikan tidak ada sintaks error atau import yang hilang sebelum menyelesaikan tugas.

### E. Pembaruan Dokumentasi Berkelanjutan
1. Jika agen menambah halaman baru, memperbarui fitur besar, atau mengubah struktur komponen, agen **wajib memperbarui dokumentasi terkait** pada folder `docs/pages/` dan mengupdate indeks pada `docs/README.md`.

---

## 5. 🚀 Perintah Cepat Pengembangan

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server lokal Vite (biasanya port 5173 atau 5174). |
| `npm run build` | Melakukan kompilasi bundle produksi untuk validasi kode. |
| `git status` | Memeriksa perubahan file yang belum di-commit. |
| `git push origin main` | Mengunggah pembaruan terbaru ke repositori GitHub. |
