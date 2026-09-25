// src/context/AppContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // ১. Cart State (LocalStorage Persistence Initializer)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Cart loading failed:", error);
      return [];
    }
  });

  const [isCartAnimated, setIsCartAnimated] = useState(false);

  // ২. Real Backend Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      console.error('Wishlist loading failed:', error);
      return [];
    }
  });

  // ৩. Auto Sync Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (err) {
      console.error('LocalStorage write error:', err);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch (err) {
      console.error('Wishlist localStorage write error:', err);
    }
  }, [wishlist]);

  // ৪. API থেকে Products এবং Categories ফেচ করা
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [resProducts, resCategories] = await Promise.all([
          fetch(`${API_BASE_URL}/api/products/`).then((res) => res.ok ? res.json() : []),
          fetch(`${API_BASE_URL}/api/categories/`).then((res) => res.ok ? res.json() : []),
        ]);

        setProducts(Array.isArray(resProducts) ? resProducts : resProducts.results || []);
        setCategories(Array.isArray(resCategories) ? resCategories : resCategories.results || []);
      } catch (error) {
        console.error('Failed to fetch initial data from backend:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // ৫. Total Cart Quantity Calculation
  const cartCount = cartItems.reduce((total, item) => total + (Number(item.quantity) || 1), 0);
  const wishlistCount = wishlist.length;

  const isInWishlist = (productId) =>
    wishlist.some((item) => String(item) === String(productId));

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => String(item) === String(productId));
      return exists
        ? prev.filter((item) => String(item) !== String(productId))
        : [...prev, Number(productId)];
    });
  };

  // 🟢 Helper to update local cart state cleanly
  const updateLocalCartState = (product) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => String(item.id || item.product) === String(product.id)
      );

      if (existingIndex > -1) {
        return prevItems.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }

      return [
        ...prevItems,
        {
          id: product.id,
          product: product.id,
          name: product.name || product.title || 'Product',
          price: Number(product.price) || 0,
          image: product.image || '',
          quantity: 1,
        },
      ];
    });
  };

  // ৬. Add to Cart Logic (Hybrid: Backend Sync + Local Fallback)
  const addToCart = async (product, callback) => {
    const itemTitle = product.name || product.title || 'Product';
    const token = localStorage.getItem('access') || localStorage.getItem('token');

    // আগে লোকাল স্টেট আপডেট করে ইউজারকে ফাস্ট রেসপন্স দেওয়া
    updateLocalCartState(product);
    toast.success(`${itemTitle} added to cart!`, { duration: 3000, position: 'top-right' });
    setIsCartAnimated(true);
    setTimeout(() => setIsCartAnimated(false), 1000);

    if (callback) callback();

    // এরপর ব্যাকএন্ডে রিকোয়েস্ট পাঠানো
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/cart/items/`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        console.warn('Backend Cart Sync Warning: Status', response.status);
      }
    } catch (error) {
      console.error('Backend Add to Cart Network Error:', error);
    }
  };

  // ৭. Clear Cart Function
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  // ৮. Update Quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        String(item.id || item.product) === String(productId)
      ? { ...item, quantity: newQuantity }
      : item
      )
    );
  };

  // ৯. Remove Single Item from Cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => String(item.id || item.product) !== String(productId))
    );
    toast.error('Item removed from cart');
  };

  return (
    <AppContext.Provider
      value={{
        cartItems,
        setCartItems,
        cartCount,
        wishlist,
        wishlistCount,
        toggleWishlist,
        isInWishlist,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        isCartAnimated,
        products,
        setProducts,
        categories,
        setCategories,
        loading,
        user,
        setUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};