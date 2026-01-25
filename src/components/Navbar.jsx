import React from 'react';
import { ShoppingBag } from 'lucide-react';

const Navbar = ({ logo }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-effect border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <div className="text-3xl firefly-glow">🔥</div>
            )}
            <h1 className="font-display text-2xl font-bold text-slate-800">
              Firefly Laptop Store
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ShoppingBag className="w-6 h-6 text-slate-700" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
