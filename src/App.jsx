import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Finance from './pages/Finance'; // [!] Sesuaikan nama file & komponennya
import ProtectedRoute from './components/ProtectedRoute';
import Todo from './pages/todo';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- [1] HALAMAN PUBLIK --- */}
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* --- [2] HALAMAN ADMIN (DIPROTEKSI) --- */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* --- [3] TAMBAHKAN ROUTE FINANCE DI SINI --- */}
        <Route
          path="/finance"
          element={
            <ProtectedRoute>
              <Finance />
            </ProtectedRoute>
          }
        />

        {/* --- [4] ROUTE TUGAS HARIAN (TODO) --- */}
        <Route
          path="/todo"
          element={
            <ProtectedRoute>
              <Todo />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App; 