// src/pages/SearchResults.jsx
import React, { useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { products = [] } = useContext(AppContext);

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

  const matchesSearchQuery = (product, searchText) => {
    const normalizedQuery = normalizeText(searchText).trim();
    if (!normalizedQuery) return false;

    const searchableText = getSearchableText(product);
    const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

    if (searchableText.includes(normalizedQuery)) return true;

    return queryTerms.every((term) => searchableText.includes(term));
  };

  const filteredProducts = products.filter((product) => matchesSearchQuery(product, query));

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    return `${API_BASE_URL}${imagePath}`;
  };

  const getCategoryLabel = (product) => {
    if (!product?.category) return 'General';
    if (typeof product.category === 'object') return product.category.name || 'General';
    return product.category;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[60vh]">
      {/* হেডার */}
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-800">
          Search Results for: <span className="text-indigo-600">"{query}"</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Found {filteredProducts.length} items matching your search
        </p>
      </div>

      {/* সার্চ রেজাল্ট প্রোডাক্ট গ্রিড */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* কোনো প্রোডাক্ট না পাওয়া গেলে */
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500 text-lg font-medium mb-2">
            No products found matching "{query}"
          </p>
          <p className="text-slate-400 text-sm mb-4">
            Try checking for spelling errors or search with different keywords.
          </p>
          <Link 
            to="/products" 
            className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition"
          >
            Browse All Products
          </Link>
        </div>
      )}
    </div>
  );
}