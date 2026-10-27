# 📄 Dokumentasi Halaman: Daily Logs (Log Harian & Timer Sesi)

- **Route**: `/logs`
- **File Sumber**: [`src/pages/DailyLogs.jsx`](../../src/pages/DailyLogs.jsx)
- **Komponen**: [`src/components/DailyLogs/`](../../src/components/DailyLogs/)
- **Akses**: Terproteksi ([`ProtectedRoute`](../../src/components/ProtectedRoute.jsx))
- **Tujuan**: Mencatat stopwatch waktu kerja teknisi/pemilik toko secara presisi (*realtime timer*), mendokumentasikan evaluasi kondisi fisik/mental harian, serta melacak rekam jejak produktivitas per bulan.

---

## 🧩 Komponen Utama (`src/components/DailyLogs/`)

| Komponen | Path File | Peran Utama |
|---|---|---|
| `LogHeader` | [`LogHeader.jsx`](../../src/components/DailyLogs/LogHeader.jsx) | Header kalender tanggal hari ini, tombol kembali, dan ringkasan status sesi. |
| `TimerSwitches` | [`TimerSwitches.jsx`](../../src/components/DailyLogs/TimerSwitches.jsx) | Sakelar tombol stopwatch untuk memulai, menghentikan, dan menyimpan durasi sesi kerja aktif (e.g. Servis Laptop, Coding, Belajar). |
| `TodayStats` | [`TodayStats.jsx`](../../src/components/DailyLogs/TodayStats.jsx) | Kartu ringkasan total jam kerja hari ini, status energi, dan mood/fokus. |
| `MonthlyTable` | [`MonthlyTable.jsx`](../../src/components/DailyLogs/MonthlyTable.jsx) | Tabel rekapitulasi data riwayat log harian yang dapat dibuka per bulan (*accordion view*). |

---

## ⚡ Fitur Utama

1. **Stopwatch Realtime Berbasis Database (`timer_states`)**:
   - Status timer disimpan di server Supabase, sehingga jika browser tertutup atau berpindah perangkat, timer tetap berjalan akurat sesuai `start_time`.
   - Update tampilan setiap 1 detik.
2. **Evaluasi Kondisi Diri**:
   - Mencatat level energi, kendala yang dihadapi hari ini, dan pencapaian utama.
3. **Rekap Bulanan**:
   - Menampilkan total jam kerja produktif per bulan untuk evaluasi ritme kerja.

---

## 💾 Struktur Tabel Database (`daily_logs` & `timer_states`)

```sql
CREATE TABLE public.daily_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tanggal DATE NOT NULL UNIQUE,
  total_menit INT DEFAULT 0,
  energi_level INT,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.timer_states (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  is_running BOOLEAN DEFAULT FALSE,
  kategori_aktivitas TEXT,
  start_time TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
