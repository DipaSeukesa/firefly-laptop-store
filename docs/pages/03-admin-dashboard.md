# 📄 Dokumentasi Halaman: Admin Dashboard (Manajemen Produk)

- **Route**: `/admin/dashboard`
- **File Sumber**: [`src/pages/AdminDashboard.jsx`](../../src/pages/AdminDashboard.jsx)
- **Akses**: Terproteksi ([`ProtectedRoute`](../../src/components/ProtectedRoute.jsx))
- **Tujuan**: Pusat kendali inventaris produk laptop dagangan untuk etalase publik, pengaturan nomor WhatsApp, dan identitas toko.

---

## ⚡ Fitur Utama

1. **Daftar Produk Laptop**:
   - Menampilkan seluruh katalog laptop dalam tabel/grid kartu modern.
   - Dilengkapi foto thumbnail, nama unit, harga jual, stok/status, dan ringkasan spesifikasi.
2. **Tambah Produk Baru**:
   - Modal formulir komprehensif untuk input nama, harga, kategori, prosesor, RAM, penyimpanan (SSD/HDD), ukuran layar, baterai, kondisi fisik, dan fitur unggulan.
   - Input foto utama (`link_gambar`) serta hingga 5 foto galeri tambahan (`images`).
3. **Edit Produk**:
   - Mengubah rincian laptop yang sudah tersimpan dengan memuat nilai formulir secara otomatis.
4. **Hapus Produk**:
   - Menghapus item dari database dengan konfirmasi ganda agar mencegah kesalahan hapus data.
5. **Modal Pengaturan Toko (`settings`)**:
   - Mengubah nomor WhatsApp tujuan pesanan pelanggan.
   - Mengubah logo toko, nama toko (*shop_name*), dan slogan toko (*shop_tagline*).
6. **Navigasi Cepat Admin**:
   - Akses cepat ke halaman internal lainnya: [Keuangan](/finance), [Tugas](/todo), [Gudang Aset](/assets), [Target](/goals), [Log Harian](/logs), dan [PC Builder](/builder).

---

## 💾 Struktur Tabel Database (`laptops`)

```sql
CREATE TABLE public.laptops (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama TEXT NOT NULL,
  harga NUMERIC NOT NULL,
  kategori TEXT,
  deskripsi TEXT,
  link_gambar TEXT,
  images TEXT,
  processor TEXT,
  ram TEXT,
  storage TEXT,
  display TEXT,
  battery_health TEXT,
  condition_physical TEXT,
  features TEXT,
  hook_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
