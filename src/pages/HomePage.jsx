import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import ProductCard from '../components/ProductCard';
import TrustBadges from '../components/TrustBadges';
import Footer from '../components/Footer';
import { AppContext } from '../context/AppContext';
import { getMediaUrl } from '../config';

export default function HomePage() {
  const { addToCart } = useContext(AppContext);
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick View Modal-এর জন্য স্টেট
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/home/');
        
        setBanners(response.data.banners || []);
        setProducts(response.data.featured_products || response.data.products || []);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('ডাটা লোড করতে সমস্যা হয়েছে!');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // 👈 ProductCard থেকে নির্বাচিত selectedVariant রিসিভ করার জন্য আপডেট
  const handleAddToCart = async (product, selectedVariant) => {
    try {
      await addToCart({
        ...product,
        id: product.id,
        name: product.name || product.title,
        price: Number(product.price) || 0,
        image: product.image || '',
        selectedVariant: selectedVariant || null,
      });
    } catch (err) {
      console.error('Add to cart error:', err);
    }
  };

  // Quick View পপ-আপ ওপেন করার ফাংশন
  const handleQuickView = (product) => {
    setQuickViewProduct(product);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6">
        {/* Banner Section */}
        {loading ? (
          <div className="w-full h-72 sm:h-[380px] bg-slate-200 animate-pulse rounded-3xl my-6" />
        ) : (
          <Banner banners={banners} />
        )}

        {/* Featured Products Section */}
        <section className="my-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Featured Products</h2>
            <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">
              View All &rarr;
            </a>
          </div>

          {error && <div className="text-red-500 my-4 text-center">{error}</div>}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-96 bg-slate-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onAddToCart={handleAddToCart}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>
          )}
        </section>

        <TrustBadges />
      </main>

      {/* Quick View Modal Popup */}
      {quickViewProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full relative shadow-xl border border-slate-100">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 font-bold text-lg w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
            >
              ✕
            </button>

            <img
              src={getMediaUrl(quickViewProduct.image) || 'https://via.placeholder.com/300'}
              alt={quickViewProduct.name}
              className="w-full h-56 object-cover rounded-2xl mb-4"
            />

            <h2 className="text-2xl font-bold text-slate-800 mb-1">{quickViewProduct.name}</h2>
            <p className="text-indigo-600 font-bold text-xl mb-3">৳ {quickViewProduct.price}</p>

            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              {quickViewProduct.description || 'এই প্রোডাক্টটির কোনো বিস্তারিত বিবরণ দেওয়া নেই।'}
            </p>

            <button
              onClick={() => {
                handleAddToCart(quickViewProduct, quickViewProduct.variants?.[0] || null);
                setQuickViewProduct(null);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold shadow-md shadow-indigo-100 transition"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}