import React from 'react';

const Filter = ({ categories, activeCategory, onCategoryChange, productCount }) => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-wrap gap-3 justify-center animate-fade-in-up stagger-3">
        <button
          onClick={() => onCategoryChange('all')}
          className={`category-btn px-6 py-3 rounded-xl font-medium shadow-lg transition-all ${
            activeCategory === 'all'
              ? 'bg-indigo-600 text-white active'
              : 'bg-white text-slate-700 shadow-md hover:shadow-lg border border-slate-200'
          }`}
        >
          Semua
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`category-btn px-6 py-3 rounded-xl font-medium shadow-lg transition-all ${
              activeCategory === category
                ? 'bg-indigo-600 text-white active'
                : 'bg-white text-slate-700 shadow-md hover:shadow-lg border border-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Stats Bar */}
      <div className="mt-6 text-center text-slate-400 animate-fade-in-up stagger-4">
        <span className="font-semibold text-white">{productCount}</span> laptop tersedia
      </div>
    </section>
  );
};

export default Filter;
