# 📄 Dokumentasi Halaman: PC Builder (Simulator Rakit Komputer)

- **Route**: `/builder`
- **File Sumber**: [`src/pages/PCBuilder.jsx`](../../src/pages/PCBuilder.jsx)
- **Komponen**: [`src/components/PCBuilder/`](../../src/components/PCBuilder/)
- **Akses**: Terproteksi ([`ProtectedRoute`](../../src/components/ProtectedRoute.jsx))
- **Tujuan**: Membantu teknisi dan calon pembeli merancang spesifikasi rakitan PC desktop secara interaktif, memvalidasi kecocokan komponen (kompatibilitas socket CPU & tipe RAM), serta menghitung total estimasi biaya dan jasa rakit.

---

## 🧩 Komponen Utama (`src/components/PCBuilder/`)

| Komponen | Path File | Peran Utama |
|---|---|---|
| `BuilderHeader` | [`BuilderHeader.jsx`](../../src/components/PCBuilder/BuilderHeader.jsx) | Header simulator, judul halaman, dan tombol reset seluruh pilihan part. |
| `BuilderSummary` | [`BuilderSummary.jsx`](../../src/components/PCBuilder/BuilderSummary.jsx) | Kartu rincian estimasi: total biaya komponen, biaya jasa rakit, estimasi daya PSU (Watt), dan tombol ekspor rincian/cetak. |

---

## ⚡ Fitur Utama & Validasi Kompatibilitas

1. **10 Kategori Komponen Utama**:
   - Processor (CPU)
   - Motherboard
   - Memory (RAM)
   - Kartu Grafis (GPU)
   - Penyimpanan (SSD / HDD)
   - Power Supply (PSU)
   - CPU Cooler / Pendingin
   - Casing Komputer
   - Kipas Casing (Fan)
   - Monitor
2. **Logika Validasi Kompatibilitas**:
   - **Socket CPU & Motherboard**: Saat CPU dipilih (misal: *LGA1700* atau *AM4*), pilihan Motherboard otomatis difilter hanya menampilkan tipe yang memiliki `socket_type` yang sama.
   - **Tipe RAM**: Motherboard yang dipilih menentukan apakah daftar RAM yang muncul berupa *DDR4* atau *DDR5*.
   - **Socket Cooler**: Hanya pendingin yang kompatibel dengan socket prosesor yang diizinkan untuk dipilih.
3. **Kalkulasi Biaya & Jasa Rakit**:
   - Menghitung total harga seluruh komponen yang dipilih ditambah biaya jasa teknisi (default `Rp 150.000`).

---

## 💾 Struktur Tabel Database (`pc_parts`)

```sql
CREATE TABLE public.pc_parts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,       -- 'CPU', 'Motherboard', 'RAM', 'GPU', dll
  price NUMERIC NOT NULL,
  socket_type TEXT,             -- e.g. 'LGA1700', 'AM4', 'AM5'
  ram_type TEXT,                -- e.g. 'DDR4', 'DDR5'
  power_consumption INT,        -- Estimasi watt (e.g. 65, 125, 250)
  image_url TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
