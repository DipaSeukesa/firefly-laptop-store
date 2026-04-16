import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Finance from './pages/Finance';
import ProtectedRoute from './components/ProtectedRoute';
import Todo from './pages/todo';
// [!] Import halaman baru
import Assets from './pages/Assets';
import DailyLogs from './pages/DailyLogs';
// import AIAvisor from './pages/AIAvisor';
import Goals from './pages/Goals';

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

        {/* --- [3] ROUTE FINANCE --- */}
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

        {/* --- [5] ROUTE GUDANG ASET --- */}
        <Route
          path="/assets"
          element={
            <ProtectedRoute>
              <Assets />
            </ProtectedRoute>
          }
        />

        {/* --- [6] ROUTE VISION GOALS --- */}
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          }
        />

        {/* --- [7] ROUTE kondisi harian --- */}
        <Route
          path="/logs"
          element={
            <ProtectedRoute>
              <DailyLogs />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;