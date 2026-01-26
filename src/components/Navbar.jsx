import React, { useState, useEffect } from 'react';
import { Lock, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Navbar = ({ logo }) => {
  // ==========================================
  // BAGIAN A: LOGIC (Auto-Hide & Auth Check)
  // ==========================================
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fungsi untuk mendeteksi scroll (Auto-Hide)
  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) { 
        setShow(false); // Scroll ke bawah, sembunyikan
      } else { 
        setShow(true); // Scroll ke atas, munculkan
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  // Cek status login untuk tombol pojok kanan
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAdmin(!!data.session);
    };
    checkUser();
  }, []);

  // ==========================================
  // BAGIAN B: TAMPILAN (Render UI)
  // ==========================================
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 
      ${show ? 'translate-y-0' : '-translate-y-full'} 
      bg-slate-900/40 backdrop-blur-md border-b border-white/10`}>
      
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* 1. Bagian Kiri: Logo & Nama Toko */}
          <div className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <div className="text-3xl animate-pulse">🔥</div>
            )}
            <h1 className="font-display text-xl md:text-2xl font-bold text-white tracking-tight">
              Firefly <span className="text-blue-400">Laptop</span>
            </h1>
          </div>

          {/* 2. Bagian Kanan: Tombol Login/Dashboard */}
          <div className="flex items-center gap-4">
            <Link 
              to={isAdmin ? "/admin/dashboard" : "/admin/login"}
              className="flex items-center gap-2 px-4 py-2 rounded-full 
                         bg-white/10 border border-white/20 text-white 
                         hover:bg-blue-600/40 hover:border-blue-400/50 
                         transition-all duration-300 text-sm font-medium"
            >
              {isAdmin ? (
                <>
                  <LayoutDashboard size={18} className="text-blue-400" />
                  <span className="hidden md:inline">Dashboard</span>
                </>
              ) : (
                <>
                  <Lock size={16} className="text-slate-300" />
                  <span>Admin</span>
                </>
              )}
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
