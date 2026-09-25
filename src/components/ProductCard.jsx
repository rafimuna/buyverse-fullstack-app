import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  Eye,
  Star,
  Check,
  Loader2,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { getMediaUrl } from '../config';

export default function ProductCard({
  product,
  onAddToCart,
  onQuickView,
}) {
  const { addToCart, toggleWishlist, isInWishlist } = useContext(AppContext);
  const navigate = useNavigate();

  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Variant Setup
  const variants = product?.variants || [];
  const [selectedVariant, setSelectedVariant] = useState(
    variants.length > 0 ? variants[0] : null
  );

  useEffect(() => {
    if (variants.length > 0) {
      setSelectedVariant(variants[0]);
    }
  }, [product]);

  if (!product) return null;

  // Dynamic Image Extractor (Checks multiple possible key names)
  const resolveProductImage = () => {
    // 1. Variant image check (if available)
    if (selectedVariant && selectedVariant.image) {
      const vImg = getMediaUrl(selectedVariant.image);
      if (vImg) return vImg;
    }

    // 2. Main Product primary fields
    const rawImage = product.image || product.primary_image || product.thumbnail || product.featured_image;

    // 3. If product images are inside an Array (e.g. product.images = [{ image: '/media/...' }])
    if (!rawImage && Array.isArray(product.images) && product.images.length > 0) {
      const firstImg = product.images[0]?.image || product.images[0];
      return getMediaUrl(firstImg);
    }

    // 4. Return processed URL
    const finalUrl = getMediaUrl(rawImage);
    return finalUrl || 'https://via.placeholder.com/400x400?text=No+Image';
  };

  const currentImage = resolveProductImage();

  // Price & Stock Calculations
  const basePrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price) || 0;
  const discountPrice = Number(product.discount_price) || 0;
  const discountPercentage = Number(product.discount_percentage) || 0;
  const stock = selectedVariant?.stock !== undefined 
    ? Number(selectedVariant.stock) 
    : (product.stock !== undefined ? Number(product.stock) : 10);

  const hasDiscount = discountPercentage > 0 && discountPrice > 0 && discountPrice < basePrice;
  const finalPrice = hasDiscount ? discountPrice : basePrice;

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const ratingValue = Number(product.rating) || 4.8;

  const handleVariantChange = (e) => {
    const variantId = parseInt(e.target.value, 10);
    const chosen = variants.find((v) => v.id === variantId);
    setSelectedVariant(chosen);
  };

  const executeAddToCart = async (callback) => {
    const itemToAdd = {
      ...product,
      id: product.id,
      name: product.name || product.title,
      price: finalPrice,
      image: currentImage,
      selectedVariant: selectedVariant || null
    };

    if (onAddToCart) {
      await onAddToCart(itemToAdd, selectedVariant);
      if (callback) callback();
    } else if (addToCart) {
      await addToCart(itemToAdd, callback);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || isAdding) return;
    try {
      setIsAdding(true);
      await executeAddToCart();
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error('Add to cart failed:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock || isAdding) return;
    try {
      setIsAdding(true);
      await executeAddToCart(() => navigate('/checkout'));
    } catch (error) {
      console.error('Buy now failed:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const isWishlisted = isInWishlist(product.id);

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product.id);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    if (onQuickView) onQuickView(product);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl"
    >
      {/* PRODUCT IMAGE & LINK */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          <img
            src={currentImage}
            alt={product.name || 'Product'}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              isOutOfStock ? 'opacity-60 grayscale' : ''
            }`}
            onError={(event) => {
              event.currentTarget.src = 'https://via.placeholder.com/400x400?text=No+Image';
            }}
          />
        </Link>

        {/* Discount Badge */}
        {hasDiscount && !isOutOfStock && (
          <span className="absolute left-3 top-3 rounded-lg bg-rose-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm pointer-events-none">
            -{discountPercentage}%
          </span>
        )}

        {/* Wishlist Button */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          type="button"
          onClick={handleWishlist}
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-all duration-200 hover:scale-110 ${
            isWishlisted ? 'text-rose-500' : 'text-slate-600 hover:text-rose-500'
          }`}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </motion.button>

        {/* Quick View Button */}
        <button
          type="button"
          onClick={handleQuickView}
          className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 translate-y-12 items-center gap-2 rounded-lg bg-white/95 px-4 py-2 text-xs font-semibold text-slate-800 opacity-0 shadow-md backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-slate-900 hover:text-white"
        >
          <Eye size={15} />
          Quick View
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] pointer-events-none">
            <span className="rounded-lg bg-slate-900/90 px-4 py-2 text-xs font-semibold text-white shadow border border-slate-700">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* PRODUCT INFORMATION */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
            {typeof product.category === 'object' ? product.category?.name : (product.category || 'General')}
          </span>
          {product.brand && (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
              {typeof product.brand === 'object' ? product.brand?.name : product.brand}
            </span>
          )}
        </div>

        {/* Product Name */}
        <Link to={`/product/${product.id}`} className="hover:text-indigo-600 transition-colors">
          <h3 className="mb-2 line-clamp-2 min-h-[48px] text-base font-semibold leading-6 text-slate-800">
            {product.name || 'Unnamed Product'}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mb-3 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                fill={star <= Math.round(ratingValue) ? 'currentColor' : 'none'}
                className={star <= Math.round(ratingValue) ? '' : 'text-slate-300'}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-slate-600">{ratingValue}</span>
          <span className="text-xs text-slate-400">({product.review_count || 0} reviews)</span>
        </div>

        {/* Price */}
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xl font-bold text-slate-900">
            ৳{finalPrice.toLocaleString('en-BD')}
          </span>
          {hasDiscount && (
            <span className="text-sm text-slate-400 line-through">
              ৳{basePrice.toLocaleString('en-BD')}
            </span>
          )}
        </div>

        {/* Variant Selector Dropdown */}
        {variants.length > 0 && (
          <div className="mb-3">
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Select Variant:
            </label>
            <select
              value={selectedVariant?.id || ''}
              onChange={handleVariantChange}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {variants.map((v) => {
                const colorName = v.color_detail?.name || '';
                const sizeName = v.size_detail?.name || '';
                const label = [colorName, sizeName].filter(Boolean).join(' - ') || `Variant #${v.id}`;
                return (
                  <option key={v.id} value={v.id}>
                    {label} (৳{v.price})
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Stock status */}
        <div className="mb-4">
          {isOutOfStock ? (
            <span className="text-xs font-semibold text-rose-500">Out of stock</span>
          ) : isLowStock ? (
            <span className="text-xs font-semibold text-amber-600">Only {stock} left</span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              In stock
            </span>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-auto grid grid-cols-2 gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all duration-200 ${
              isOutOfStock
                ? 'cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200'
                : isAdded
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'cursor-pointer bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
            }`}
          >
            {isAdding ? (
              <Loader2 size={15} className="animate-spin" />
            ) : isAdded ? (
              <>
                <Check size={15} />
                Added
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                Cart
              </>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock || isAdding}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all duration-200 ${
              isOutOfStock
                ? 'cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200'
                : 'cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
            }`}
          >
            <Zap size={15} />
            Buy Now
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

// new code 