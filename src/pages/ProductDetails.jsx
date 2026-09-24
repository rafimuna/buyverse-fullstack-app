// src/pages/ProductDetails.jsx
import React, { useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ShoppingCart, ArrowLeft, Star, ShieldCheck, Truck } from 'lucide-react';
import { getMediaUrl } from '../config';

export default function ProductDetails() {
  const { id } = useParams(); // URL থেকে প্রোডাক্টের ID নেওয়া হচ্ছে
  const navigate = useNavigate();
  const { products = [], addToCart } = useContext(AppContext);

  // ID দিয়ে নির্দিষ্ট প্রোডাক্টটিকে খুঁজে বের করা
  const product = products.find((item) => String(item.id) === String(id));

  // প্রোডাক্ট না পাওয়া গেলে
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Product Not Found!</h2>
        <p className="text-slate-500 mb-6">The product you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium mb-6 transition"
      >
        <ArrowLeft size={18} /> Go Back
      </button>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* Left Column: Image */}
        <div className="flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden p-4">
          <img
            src={getMediaUrl(product.image) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'}
            alt={product.name}
            className="w-full h-80 md:h-96 object-contain rounded-lg"
          />
        </div>

        {/* Right Column: Info & Action */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {product.category || 'General'}
              </span>
              {product.brand && (
                <span className="text-xs font-medium text-slate-500">
                  Brand: {product.brand}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
              {product.name}
            </h1>

            {/* Rating (Static Example) */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <span className="text-xs text-slate-500 font-medium">(4.8 / 5.0)</span>
            </div>

            <p className="text-3xl font-black text-slate-900 mb-6">
              ${product.price}
            </p>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {product.description ||
                'Experience premium quality and exceptional reliability with this item. Built with modern specifications to meet your daily needs seamlessly.'}
            </p>
          </div>

          {/* Action Buttons & Features */}
          <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={() => addToCart(product)}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition shadow-md shadow-indigo-200 active:scale-[0.98]"
              >
                <ShoppingCart size={20} /> Add to Cart
              </button>
            </div>

            {/* Additional Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-indigo-600" /> Free Shipping
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-indigo-600" /> 1 Year Warranty
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}