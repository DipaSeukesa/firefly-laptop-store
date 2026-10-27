# 📄 Dokumentasi Halaman: Todo (Tugas Harian & Fokus)

- **Route**: `/todo`
- **File Sumber**: [`src/pages/todo.jsx`](../../src/pages/todo.jsx)
- **Akses**: Terproteksi ([`ProtectedRoute`](../../src/components/ProtectedRoute.jsx))
- **Tujuan**: Manajemen tugas dan rencana kerja harian pemilik toko/teknisi yang terbagi dalam kategori kehidupan (Sekolah, Usaha, Rumah, Umum), sub-tugas (*parent-child*), serta tab fokus prioritas.

---

## ⚡ Fitur Utama

1. **Tab Navigasi Mode**:
   - **Mode Fokus (`focus`)**: Menampilkan tugas berstatus bintang (*starred*) atau memiliki batas waktu hari ini & besok.
   - **Mode Struktur Folder (`folders`)**: Menampilkan seluruh tugas berdasarkan 4 folder utama:
     - 🎓 **Sekolah**: Tugas akademik / studi.
     - 💼 **Usaha**: Pekerjaan toko laptop, stok, servis pelanggan, dan konten marketing.
     - 🏠 **Rumah**: Keperluan domestik & keluarga.
     - 🌐 **Umum**: Tugas serbaguna lainnya.
2. **Sub-Tugas Hirarkis (*Parent-Child Tasks*)**:
   - Sebuah tugas utama dapat dipecah menjadi beberapa sub-tugas langkah kecil.
   - Menyelesaikan seluruh sub-tugas secara otomatis memperbarui progres tugas induk.
3. **Catatan Teknis (*Task Notes*)**:
   - Setiap tugas dapat menyimpan catatan/detail instruksi tambahan yang dapat dibuka secara *collapsible*.
4. **Indikator Progres Persentase**:
   - Batang progres visual di bagian atas menampilkan persentase target tugas yang berhasil diselesaikan pada hari ini.
5. **Show/Hide Tugas Selesai**:
   - Pengguna dapat menyembunyikan tugas yang sudah selesai (*completed*) agar layar tetap rapi dan tidak penuh.

---

## 💾 Struktur Tabel Database (`todos`)

```sql
CREATE TABLE public.todos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task TEXT NOT NULL,
  category TEXT DEFAULT 'Umum',
  due_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  parent_id BIGINT REFERENCES public.todos(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
