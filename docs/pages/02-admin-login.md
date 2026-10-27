# 📄 Dokumentasi Halaman: Admin Login

- **Route**: `/admin/login`
- **File Sumber**: [`src/pages/AdminLogin.jsx`](../../src/pages/AdminLogin.jsx)
- **Akses**: Publik (Otomatis redirect ke `/admin/dashboard` jika sudah login)
- **Tujuan**: Mengautentikasi akun admin toko menggunakan Supabase Auth agar dapat mengelola data internal (produk, keuangan, tugas, aset, dan konfigurasi sistem).

---

## 🔒 Alur Autentikasi

1. **Pemeriksaan Sesi Awal**:
   Saat halaman dimuat, `supabase.auth.getSession()` mengecek apakah admin sudah memiliki sesi aktif. Jika ya, pengguna langsung dialihkan ke `/admin/dashboard`.
2. **Formulir Kredensial**:
   - `Email`: Alamat email terdaftar admin di Supabase Auth.
   - `Password`: Kata sandi akun admin.
3. **Proses Login**:
   Menggunakan API `supabase.auth.signInWithPassword({ email, password })`.
4. **Penanganan Error**:
   Jika kredensial salah atau koneksi bermasalah, alert pesan kesalahan akan ditampilkan secara ramah kepada pengguna.
5. **Proteksi Route**:
   Setelah berhasil masuk, token sesi disimpan secara otomatis di local storage browser oleh Supabase SDK, membuka akses ke semua halaman ber-wrapper [`ProtectedRoute`](../../src/components/ProtectedRoute.jsx).

---

## 🎨 Antarmuka & UX
- Tampilan bertema gelap (*slate-950*) dengan aksen *cyan-500* modern.
- Dilengkapi tombol kembali ke beranda publik (`/`).
- Tombol intip kata sandi (*show/hide password*).
- Indikator loading saat autentikasi berlangsung.
