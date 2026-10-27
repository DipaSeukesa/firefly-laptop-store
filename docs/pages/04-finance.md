# 📄 Dokumentasi Halaman: Finance (Keuangan & Arus Kas)

- **Route**: `/finance`
- **File Sumber**: [`src/pages/Finance.jsx`](../../src/pages/Finance.jsx)
- **Akses**: Terproteksi ([`ProtectedRoute`](../../src/components/ProtectedRoute.jsx))
- **Tujuan**: Mengelola pembukuan arus kas, saldo multi-dompet (bank, e-wallet, tunai), perhitungan margin laba bersih/kotor, fee transfer, dan arsip riwayat transaksi toko.

---

## 🧩 Komponen Pendukung (`src/components/finance/`)

| Komponen | Path File | Peran Utama |
|---|---|---|
| `FinanceHero` | [`FinanceHero.jsx`](../../src/components/finance/FinanceHero.jsx) | Kartu ringkasan total saldo gabungan, pemasukan, pengeluaran, dan net margin bulan berjalan. |
| `WalletList` | [`WalletList.jsx`](../../src/components/finance/WalletList.jsx) | Daftar rekening bank / dompet digital (e.g. BCA, BRI, Dana, Cash Fisik) dengan saldo masing-masing. |
| `TransactionTable` | [`TransactionTable.jsx`](../../src/components/finance/TransactionTable.jsx) | Tabel daftar transaksi terbaru, filter tanggal, tipe transaksi, dan status. |
| `TransactionModal` | [`TransactionModal.jsx`](../../src/components/finance/TransactionModal.jsx) | Pop-up pencatatan transaksi masuk, keluar, atau mutasi antar-dompet beserta fee. |
| `TransactionArchive` | [`TransactionArchive.jsx`](../../src/components/finance/TransactionArchive.jsx) | Tampilan arsip transaksi yang dikelompokkan per bulan/tahun untuk audit. |
| `RealityFinance` | [`RealityFinance.jsx`](../../src/components/finance/RealityFinance.jsx) | Analisis kesehatan finansial, rasio bakar modal (*burn rate*), dan cadangan kas lab. |

---

## 💾 Integrasi Database Supabase

### 1. Tabel `transactions`
- `tanggal`: Tanggal eksekusi transaksi.
- `keterangan`: Deskripsi transaksi (e.g. *Jual ThinkPad T480*, *Beli Pasta Thermal*).
- `jumlah`: Nominal uang transaksi.
- `harga_beli`: Harga modal awal (untuk menghitung margin laba kotor transaksi penjualan).
- `fee_transfer`: Potongan biaya admin transfer atau penarikan dana.
- `tipe_transaksi`: Jenis transaksi (`toko`, `pribadi`, `operasional`).
- `kategori`: Kategori keuangan (`pemasukan penjualan`, `pengeluaran servis`, `operasional`, dll).
- `sub_kategori`: Rincian pengelompokan spesifik.
- `dari_wallet_id`: ID dompet sumber (untuk pengeluaran / transfer).
- `ke_wallet_id`: ID dompet tujuan (untuk pemasukan / transfer).

### 2. Tabel `wallets`
- `id`: Identitas dompet.
- `nama`: Nama rekening/dompet (e.g. *BCA Rekening Toko*, *Kas Tunai Kasir*).
- `saldo`: Saldo kas yang tersedia saat ini.
- `tipe`: Kategori instrumen (`bank`, `ewallet`, `cash`).

---

## 📱 Gesture & Interaksi
- **Touch Swipe Navigation**: Pada perangkat mobile, pengguna dapat menggeser layar ke kiri atau kanan (*touch swipe*) untuk beralih instan antara mode **Tabel Transaksi** dan mode **Arsip Bulanan**.
