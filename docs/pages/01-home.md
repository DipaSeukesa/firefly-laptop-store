# 📄 Dokumentasi Halaman: Home (Katalog Laptop Publik)

- **Route**: `/`
- **File Sumber**: [`src/pages/Home.jsx`](../../src/pages/Home.jsx)
- **Akses**: Publik (Tidak memerlukan login)
- **Tujuan**: Menampilkan etalase produk laptop kepada pelanggan dengan filter pencarian, galeri foto, spesifikasi lengkap, dan tombol pemesanan langsung ke WhatsApp admin.

---

## 🧩 Komponen Pendukung

| Komponen | Path File | Peran Utama |
|---|---|---|
| `Navbar` | [`src/components/Navbar.jsx`](../../src/components/Navbar.jsx) | Navigasi atas, logo toko, tautan cepat, dan indikator status admin. |
| `Hero` | [`src/components/Hero.jsx`](../../src/components/Hero.jsx) | Banner promo utama, tagline toko, dan tombol ajakan bertindak (CTA). |
| `Filter` | [`src/components/Filter.jsx`](../../src/components/Filter.jsx) | Tombol kategori produk (Semua, ThinkPad, Dell, Asus, dll) & rentang harga. |
| `ProductCard` | [`src/components/ProductCard.jsx`](../../src/components/ProductCard.jsx) | Kartu etalase laptop: foto utama, nama, harga, ringkasan spek, & badge kondisi. |
| `ProductDetailModal` | [`src/components/ProductDetailModal.jsx`](../../src/components/ProductDetailModal.jsx) | Pop-up detail: carousel foto galeri, spesifikasi lengkap, dan tombol direct WA. |
| `Footer` | [`src/components/Footer.jsx`](../../src/components/Footer.jsx) | Informasi kontak, alamat toko, jam buka, dan tautan sosial media. |

---

## 💾 Integrasi Database Supabase

Halaman ini berinteraksi dengan dua tabel Supabase secara **Realtime**:

### 1. Tabel `laptops`
Mengambil seluruh daftar produk laptop yang aktif:
- `nama`: Nama model laptop (e.g. *ThinkPad T480s*).
- `harga`: Harga jual produk.
- `kategori`: Kategori/merk laptop.
- `processor`, `ram`, `storage`, `display`, `battery_health`: Detail spesifikasi teknis.
- `condition_physical`: Deskripsi kemulusan fisik unit (e.g. *95% Mulus*).
- `link_gambar`: URL foto thumbnail utama.
- `images`: Kumpulan URL foto galeri tambahan (dipisah koma).
- `hook_description`: Kalimat rekomendasi promosi singkat.

### 2. Tabel `settings`
Mengambil konfigurasi profil toko:
- `whatsapp`: Nomor WhatsApp admin untuk tombol pemesanan instan.
- `logo`: URL logo toko.
- `shop_name`, `shop_tagline`: Nama & slogan toko.

---

## ⚡ Fitur Utama
1. **Pencarian Cerdas**: Pencarian multi-kata pada nama produk, prosesor, RAM, atau deskripsi.
2. **Filter Multi-Dimensi**: Filter instan berdasarkan kategori merek dan pengurutan harga termurah/termahal.
3. **Pemesanan WhatsApp Terformat**: Mengklik tombol *"Beli via WhatsApp"* otomatis membuat template pesan chat berisi nama unit, harga, dan tautan spesifik produk.
4. **Realtime Update**: Jika admin menambah, mengedit, atau menghapus laptop di dashboard, halaman katalog pelanggan langsung terupdate otomatis tanpa perlu refresh browser.
