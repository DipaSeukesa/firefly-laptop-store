/* global __APP_VERSION__ */
import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  LayoutDashboard,
  ChevronDown,
  Wallet,
  CheckSquare,
  Laptop,    // <--- PASTIKAN INI ADA
  Package,
  Activity,
  Target,
  Cpu,
  LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Navbar = ({ logo }) => {

  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Untuk Dropdown
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Gunakan pengecekan agar jika variabel belum siap, aplikasi tidak crash
  const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'loading...';

  // Handle Klik di luar dropdown untuk menutup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setShow(false);
        setIsOpen(false); // Tutup dropdown saat scroll
      } else {
        setShow(true);
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAdmin(!!data.session);
    };
    checkUser();

    // Listen perubahan auth (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAdmin(!!session);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    navigate('/'); // Kembali ke Home setelah logout
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 
      ${show ? 'translate-y-0' : '-translate-y-full'} 
      bg-slate-900/60 backdrop-blur-xl border-b border-white/10`}>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">

          {/* 1. Bagian Kiri: Logo & Slogan */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
            {logo ? (
              <img src={logo} alt="Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-110" />
            ) : (
              <div className="text-3xl animate-pulse group-hover:scale-110 transition-transform">🔥</div>
            )}

            <div className="flex flex-col leading-tight">
              <h1 className="font-display text-lg md:text-xl font-bold text-white tracking-tight">
                Firefly <span className="text-blue-400">Laptop</span>
              </h1>
              {/* Teks kecil di bawah nama brand */}
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                v.{__APP_VERSION__}
              </span>
            </div>
          </Link>

          {/* 2. Bagian Kanan: Auth & Dropdown */}
          <div className="flex items-center gap-4">
            {!isAdmin ? (
              // Tampilan jika BELUM login
              <Link
                to="/admin/login"
                className="flex items-center gap-2 px-5 py-2 rounded-full 
                           bg-white/5 border border-white/10 text-white 
                           hover:bg-blue-600 hover:border-blue-400 transition-all text-sm font-medium"
              >
                <Lock size={16} />
                <span>Admin</span>
              </Link>
            ) : (
              // Tampilan jika SUDAH login (DROPDOWN)
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full 
                             bg-blue-600 text-white hover:bg-blue-500 
                             transition-all duration-300 text-sm font-medium shadow-lg shadow-blue-900/20"
                >
                  <LayoutDashboard size={18} />
                  <span className="hidden md:inline">My Workspace</span>
                  <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu Items */}
                {isOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-slate-900 border border-white/10 
                                  shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-2 border-b border-white/5 bg-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 px-3 py-1">Management</p>
                    </div>

                    <Link to="/admin/dashboard" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 transition-colors">
                      <Laptop size={18} className="text-blue-400" />
                      Stok Laptop
                    </Link>

                    {/* Uang Manager - Existing */}
                    <Link to="/finance" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 transition-colors">
                      <Wallet size={18} className="text-emerald-400" />
                      Uang Manager
                    </Link>

                    {/* Vision Goals - NEW (Pelacakan Target) */}
                    <Link to="/goals" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 transition-colors">
                      <Target size={18} className="text-emerald-400" />
                      Vision Goals
                    </Link>

                    {/* Tugas Harian - Existing */}
                    <Link to="/todo" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 transition-colors">
                      <CheckSquare size={18} className="text-amber-400" />
                      Tugas Harian
                    </Link>

                    {/* Inventaris Aset - NEW (Penting untuk modal 100jt) */}
                    <Link to="/assets" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 transition-colors">
                      <Package size={18} className="text-cyan-400" />
                      Gudang Aset
                    </Link>

                    {/* Log Harian - NEW (Bahan bakar Peta Realitas) */}
                    <Link to="/logs" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 transition-colors">
                      <Activity size={18} className="text-rose-400" />
                      Kondisi Harian
                    </Link>

                    {/* AI Advisor - NEW (Pusat Komando/Tuning Prompt) */}
                    <Link to="/ai-advisor" onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-white/10 transition-colors">
                      <Cpu size={18} className="text-purple-400" />
                      AI Penasehat
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5">
                      <LogOut size={18} />
                      Keluar Akun
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;