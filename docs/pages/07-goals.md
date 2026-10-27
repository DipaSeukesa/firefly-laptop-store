# 📄 Dokumentasi Halaman: Goals (Visi & Target Strategis)

- **Route**: `/goals`
- **File Sumber**: [`src/pages/Goals.jsx`](../../src/pages/Goals.jsx)
- **Komponen**: [`src/components/Goals/`](../../src/components/Goals/)
- **Akses**: Terproteksi ([`ProtectedRoute`](../../src/components/ProtectedRoute.jsx))
- **Tujuan**: Memetakan target jangka pendek, menengah, dan panjang untuk ekspansi bisnis laptop, pengadaan peralatan lab baru, maupun akumulasi tabungan finansial dengan pelacakan persentase interaktif.

---

## 🧩 Komponen Utama (`src/components/Goals/`)

| Komponen | Path File | Peran Utama |
|---|---|---|
| `GoalCard` | [`GoalCard.jsx`](../../src/components/Goals/GoalCard.jsx) | Kartu visual untuk setiap target: persentase progres, progress bar, nominal tercapai vs target akhir, level prioritas, dan deadline. |
| `GoalModal` | [`GoalModal.jsx`](../../src/components/Goals/GoalModal.jsx) | Pop-up formulir untuk menambah atau mengedit target, memilih kategori, menentukan deadline, dan memasukkan catatan strategi. |
| `RealityGoals` | [`RealityGoals.jsx`](../../src/components/Goals/RealityGoals.jsx) | Analisis keselarasan antara target tujuan toko dengan realitas arus kas kasir dan aset saat ini. |

---

## ⚡ Fitur Utama

1. **Kategori Target**:
   - `Asset`: Pengadaan aset baru (e.g. *Beli Mikroskop Servis*, *Stok 10 Laptop ThinkPad*).
   - `Financial`: Target saldo tabungan kasir atau laba bersih bulanan.
   - `Personal / Skill`: Peningkatan keahlian teknis (e.g. *Sertifikasi BGA Reballing*).
2. **Prioritas & Urgensi**:
   - Skala prioritas 1 (Kritis / Tertinggi) hingga 3 (Normal).
3. **Pelacakan Waktu Mundur (*Deadline Countdown*)**:
   - Menghitung sisa hari hingga tenggat waktu target berakhir untuk memicu kedisiplinan eksekusi.
4. **Update Progres Cepat**:
   - Memungkinkan admin menambah jumlah nominal terkini (*current_amount*) secara berkala.

---

## 💾 Struktur Tabel Database (`goals`)

```sql
CREATE TABLE public.goals (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama_goal TEXT NOT NULL,
  category TEXT DEFAULT 'Asset',
  priority_level INT DEFAULT 3,
  target_akhir NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  satuan TEXT DEFAULT 'Rupiah',
  deadline DATE,
  catatan_strategis TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
