// src/components/Navbar.jsx
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Heart, Menu, X, ArrowRight } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function Navbar() {
  const { categories = [], cartCount, wishlistCount, isCartAnimated, user, products = [] } = useContext(AppContext);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const normalizeText = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const getSearchableText = (product) => {
    const values = [
      product?.name,
      product?.title,
      product?.slug,
      product?.description,
      product?.short_description,
      product?.category?.name,
      product?.category,
      product?.category_name,
      product?.brand?.name,
      product?.brand,
      Array.isArray(product?.tags) ? product.tags.join(' ') : product?.tags,
    ];

    return values.filter(Boolean).map((value) => normalizeText(value)).join(' ');
  };

  const matchesSearchQuery = (product, query) => {
    const searchText = normalizeText(query).trim();
    if (!searchText) return false;

    const searchableText = getSearchableText(product);
    const queryTerms = searchText.split(/\s+/).filter(Boolean);

    if (queryTerms.length === 0) return false;

    if (searchableText.includes(searchText)) return true;

    return queryTerms.every((term) => searchableText.includes(term));
  };

  // ১. ডাইনামিক ফিল্টারিং লজিক (ইনপুটে টাইপ করার সাথে সাথেই ফিল্টার হবে)
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length > 0) {
      const filtered = products.filter((product) => matchesSearchQuery(product, trimmedQuery));
      setFilteredProducts(filtered.slice(0, 5));
      setShowDropdown(true);
    } else {
      setFilteredProducts([]);
      setShowDropdown(false);
    }
  }, [searchQuery, products]);

  // ২. সার্চ ইনপুট বক্সের বাইরে ক্লিক করলে সাজেশন ড্রপডাউন হাইড হবে
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ৩. ফর্ম সাবমিট হ্যান্ডলার (Enter চাপলে সার্চ রেজাল্ট পেজে নিয়ে যাবে)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // ৪. সাজেশন ড্রপডাউন থেকে নির্দিষ্ট প্রোডাক্টে ক্লিক করলে সরাসরি প্রোডাক্ট ডিটেইলসে যাবে
  const handleSelectProduct = (productId) => {
    setShowDropdown(false);
    setSearchQuery('');
    navigate(`/product/${productId}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-700 hover:text-indigo-600 p-1 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <Link to="/" className="text-2xl font-black text-indigo-600 tracking-tight">
              Buy<span className="text-slate-800">Verse</span>
            </Link>
          </div>

          {/* Desktop Search Bar with Live Dropdown */}
          <div ref={searchRef} className="flex-1 max-w-lg hidden md:block relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                placeholder="Search products, brands, categories..."
                className="w-full pl-4 pr-10 py-2 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-indigo-600 transition">
                <Search size={18} />
              </button>
            </form>

            {/* Live Search Suggestions Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                {filteredProducts.length > 0 ? (
                  <div className="py-2">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product.id)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition border-b border-slate-50 last:border-none"
                      >
                        {product.image && (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-10 h-10 object-cover rounded-lg border border-slate-100"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                          <p className="text-xs text-indigo-600 font-medium">${product.price}</p>
                        </div>
                        <ArrowRight size={14} className="text-slate-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No products found for "<span className="font-semibold text-slate-700">{searchQuery}</span>"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-4 text-slate-700">
            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className={`relative transition p-1 hidden sm:block ${wishlistCount > 0 ? 'text-rose-500' : 'text-slate-700 hover:text-indigo-600'}`}
            >
              <Heart size={22} fill={wishlistCount > 0 ? 'currentColor' : 'none'} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Dynamic Cart Badge with Bounce Animation */}
            <Link 
              to="/checkout" 
              className={`relative hover:text-indigo-600 transition p-2 rounded-full ${
                isCartAnimated ? 'scale-125 text-indigo-600' : ''
              } transition-all duration-300`}
            >
              <ShoppingCart size={22} className={isCartAnimated ? 'animate-bounce' : ''} />
              
              {cartCount > 0 && (
                <span 
                  className={`absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center transition-transform ${
                    isCartAnimated ? 'scale-125 bg-emerald-500' : 'scale-100'
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Dynamic User Profile / Login */}
            <Link 
              to={user ? "/profile" : "/login"} 
              className="flex items-center gap-2 hover:text-indigo-600 transition pl-2 border-l border-slate-200"
            >
              <User size={22} />
              <span className="text-sm font-medium hidden sm:inline">
                {user ? user.first_name || 'Account' : 'Login'}
              </span>
            </Link>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-4 pr-10 py-2 rounded-full border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-slate-400">
              <Search size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Dynamic Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link 
            to="/" 
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-indigo-600 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/products" 
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-indigo-600 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            All Products
          </Link>
          
          {categories.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Categories
              </span>
              {categories.map((cat) => (
                <Link 
                  key={cat.id || cat.slug} 
                  to={`/category/${cat.slug || cat.id}`}
                  className="block py-1.5 pl-2 text-sm text-slate-600 hover:text-indigo-600 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}