# 📚 Dokumentasi Sistem Firefly Laptop Store

Selamat datang di repositori dokumentasi resmi **Firefly Laptop Store & Reality Lab System**. Dokumen ini merangkum seluruh arsitektur halaman, komponen, struktur database Supabase, dan alur kerja aplikasi.

---

## 🗂️ Daftar Indeks Dokumentasi Per Halaman

Setiap halaman di aplikasi didokumentasikan secara rinci pada folder [`docs/pages/`](./pages/):

| No | File Dokumentasi | Halaman (Route) | File Sumber | Deskripsi Utama |
|---|---|---|---|---|
| 01 | [01-home.md](./pages/01-home.md) | `/` (Publik) | [`src/pages/Home.jsx`](../src/pages/Home.jsx) | Katalog laptop, filter harga & kategori, detail modal, dan integrasi WhatsApp. |
| 02 | [02-admin-login.md](./pages/02-admin-login.md) | `/admin/login` | [`src/pages/AdminLogin.jsx`](../src/pages/AdminLogin.jsx) | Autentikasi aman Admin menggunakan Supabase Auth (Email & Password). |
| 03 | [03-admin-dashboard.md](./pages/03-admin-dashboard.md) | `/admin/dashboard` | [`src/pages/AdminDashboard.jsx`](../src/pages/AdminDashboard.jsx) | Manajemen CRUD produk laptop dagangan, konfigurasi toko, dan galeri foto. |
| 04 | [04-finance.md](./pages/04-finance.md) | `/finance` | [`src/pages/Finance.jsx`](../src/pages/Finance.jsx) | Pembukuan kas masuk/keluar, dompet/rekening, modal, fee transfer, dan arsip transaksi. |
| 05 | [05-todo.md](./pages/05-todo.md) | `/todo` | [`src/pages/todo.jsx`](../src/pages/todo.jsx) | Manajemen tugas harian (Sekolah, Usaha, Rumah, Umum), sub-tugas, dan fokus harian. |
| 06 | [06-assets.md](./pages/06-assets.md) | `/assets` | [`src/pages/Assets.jsx`](../src/pages/Assets.jsx) | Gudang aset fisik, Reality Map 6 zona (RK1-3, MJ1-3), filter L1/L2/L3, & generator matriks. |
| 07 | [07-goals.md](./pages/07-goals.md) | `/goals` | [`src/pages/Goals.jsx`](../src/pages/Goals.jsx) | Target tabungan & target strategis toko dengan progress tracking interaktif. |
| 08 | [08-daily-logs.md](./pages/08-daily-logs.md) | `/logs` | [`src/pages/DailyLogs.jsx`](../src/pages/DailyLogs.jsx) | Stopwatch timer kerja aktif, evaluasi energi harian, dan ringkasan bulanan. |
| 09 | [09-pc-builder.md](./pages/09-pc-builder.md) | `/builder` | [`src/pages/PCBuilder.jsx`](../src/pages/PCBuilder.jsx) | Simulator konfigurator rakit PC dengan validasi socket/RAM dan perhitungan estimasi total. |

---

## 🤖 Petunjuk untuk AI / Pengembang

Untuk agen AI atau developer yang ingin memodifikasi atau menambah fitur baru, wajib membaca panduan standar di:
👉 **[AGENTS.md](../AGENTS.md)** (atau [agen.md](../agen.md))

Panduan tersebut memuat aturan arsitektur, konvensi penamaan kode, keamanan lingkungan (`.env`), serta pedoman UI/UX.

---

## 🛠️ Ringkasan Teknologi

- **Frontend Core**: React 18 (Vite 5), React Router DOM v6
- **Styling**: Tailwind CSS v3, Glassmorphism Dark Mode
- **Icons**: Lucide React
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Supabase Realtime Channels)
- **Eksport Gambar**: html2canvas
