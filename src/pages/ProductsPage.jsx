// src/pages/ProductsPage.jsx
import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard'; // আপনার তৈরি করা ProductCard কম্পোনেন্ট

export default function ProductsPage() {
  const { slug } = useParams();
  const { products = [], categories = [] } = useContext(AppContext);

  // ক্যাটাগরি অনুযায়ী ফিল্টার লজিক (যদি ক্যাটাগরি ক্লিক করে আসে)
  const filteredProducts = slug
    ? products.filter((p) => {
        const catSlugOrName = typeof p.category === 'object' ? (p.category?.slug || p.category?.name) : p.category;
        return String(catSlugOrName).toLowerCase() === String(slug).toLowerCase();
      })
    : products;

  const currentCategory = categories.find(
    (c) => String(c.slug || c.id).toLowerCase() === String(slug).toLowerCase()
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 capitalize">
            {slug ? (currentCategory?.name || slug) : 'All Products'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
            <p className="text-slate-500 font-medium">No products found in this section.</p>
            {slug && (
              <Link 
                to="/products" 
                className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
              >
                Browse All Products
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}