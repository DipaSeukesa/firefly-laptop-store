import React, { useState } from 'react';
import { Search } from 'lucide-react';

const Hero = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header className="hero-gradient text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 pt-24">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="text-8xl firefly-glow">
              🔥
            </div>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4 animate-fade-in-up">
            Firefly Laptop Store
          </h1>
          <p className="text-xl md:text-2xl text-purple-200 animate-fade-in-up stagger-1 mb-8">
            Kualitas Terbaik yang sulit Dicari di Tempat Lain, Layaknya Mencari Firefly.
          </p>
          
          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto animate-fade-in-up stagger-2">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleChange}
                placeholder="Cari laptop..."
                className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 transition-all"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              >
                <Search className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
