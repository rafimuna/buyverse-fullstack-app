// src/pages/CheckoutPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ShoppingBag, ArrowLeft, CheckCircle2, ShieldCheck, Truck, CreditCard, Loader2 } from 'lucide-react';
import { API_BASE_URL, getMediaUrl } from '../config';


export default function CheckoutPage() {
  const { cartItems, setCartItems, clearCart, products } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
    city: 'Dhaka',
  });

  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    mobile: '01700000000',
    pin: '1234',
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const getStoredToken = () =>
    localStorage.getItem('access') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    '';

  // 🟢 Helper to fix absolute/relative image path
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/100';
    return getMediaUrl(imagePath);
  };

  // 🟢 ১. ব্যাকএন্ড থেকে কার্ট ডাটা সিঙ্ক (JWT Bearer Auth)
  useEffect(() => {
    let isMounted = true;

    const fetchCartFromBackend = async () => {
      setIsLoadingCart(true);
      const token = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('token');

      const localCart = (() => {
        try {
          const savedCart = localStorage.getItem('cart');
          return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
          return [];
        }
      })();

      if (!token) {
        if (isMounted) {
          setCartItems(localCart);
          setIsLoadingCart(false);
        }
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      try {
        const response = await fetch(`${API_BASE_URL}/api/cart/items/`, {
          method: 'GET',
          headers,
        });

        if (response.status === 401 || response.status === 403) {
          if (isMounted) {
            setCartItems(localCart);
            setIsLoadingCart(false);
          }
          return;
        }

        if (response.ok) {
          const data = await response.json();

          let rawItems = [];
          if (Array.isArray(data)) {
            rawItems = data;
          } else if (Array.isArray(data.results)) {
            rawItems = data.results;
          } else if (Array.isArray(data.items)) {
            rawItems = data.items;
          }

          if (isMounted) {
            if (rawItems.length > 0) {
              const formattedCart = rawItems.map((item) => {
                const isObj = typeof item.product === 'object' && item.product !== null;
                const prodId = isObj ? item.product.id : item.product;

                const matchedProduct = (products || []).find((p) => String(p.id) === String(prodId));
                const rawImage = isObj
                  ? item.product.image
                  : (matchedProduct?.image || item.image || '');

                return {
                  id: prodId,
                  cart_item_id: item.id,
                  name: isObj ? item.product.name : (matchedProduct?.name || item.product_name || 'Product'),
                  price: isObj ? Number(item.product.price) : Number(matchedProduct?.price || item.price || 0),
                  image: getImageUrl(rawImage),
                  quantity: Number(item.quantity) || 1,
                };
              });

              setCartItems(formattedCart);
            } else if (localCart.length > 0) {
              setCartItems(localCart);
            } else {
              setCartItems([]);
            }
          }
        } else if (localCart.length > 0) {
          if (isMounted) setCartItems(localCart);
        }
      } catch (err) {
        console.error('Backend Cart Fetch Error:', err);
        if (isMounted && localCart.length > 0) {
          setCartItems(localCart);
        }
      } finally {
        if (isMounted) setIsLoadingCart(false);
      }
    };

    fetchCartFromBackend();

    return () => {
      isMounted = false;
    };
  }, [products]);

  // 🟢 ২. কার্ট হিসাব-নিকাশ
  const subtotal = (cartItems || []).reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  const shippingCost = formData.city.toLowerCase() === 'dhaka' ? 60 : 120;
  const grandTotal = subtotal + shippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitOrderToBackend = async () => {
    const token = getStoredToken();
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const orderPayload = {
      shipping_name: formData.shipping_name,
      shipping_phone: formData.shipping_phone,
      shipping_address: `${formData.shipping_address}, ${formData.city}`,
      shipping_cost: Number(shippingCost),
      total: Number(grandTotal),
      is_paid: true,
      payment_status: 'paid',
      items: cartItems.map((item) => ({
        product: Number(item.id),
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
      })),
    };

    const response = await fetch(`${API_BASE_URL}/api/orders/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderPayload),
    });

    if (response.ok || response.status === 201) {
      return true;
    }

    const errorData = await response.json().catch(() => ({}));
    const detailMessage =
      errorData.detail ||
      errorData.non_field_errors?.[0] ||
      'অর্ডার প্রক্রিয়া করতে সমস্যা হয়েছে।';

    const isAuthError = response.status === 401 || response.status === 403 || /token.*valid|invalid token|authentication/i.test(String(detailMessage));

    if (isAuthError) {
      localStorage.removeItem('access');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh');
      throw new Error('অর্ডার প্রক্রিয়া করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন বা লগইন করে অর্ডার দিন।');
    }

    throw new Error(detailMessage);
  };

  const dummyPaymentRequest = async (mobile, pin) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (String(mobile).trim() === '0000') {
      throw new Error('Payment Failed: Invalid mobile number.');
    }

    if (!String(pin).trim()) {
      throw new Error('PIN is required.');
    }

    return {
      success: true,
      message: 'Payment successful',
      is_paid: true,
    };
  };

  // 🟢 ৩. অর্ডার সাবমিশন
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setPaymentError('');

    if (!cartItems || cartItems.length === 0) {
      setErrorMessage('কার্টে কোনো পণ্য নেই।');
      setIsSubmitting(false);
      return;
    }

    setShowPaymentModal(true);
    setIsSubmitting(false);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentError('');
    setIsProcessingPayment(true);

    try {
      await dummyPaymentRequest(paymentForm.mobile, paymentForm.pin);

      await submitOrderToBackend();

      if (clearCart) clearCart();
      setShowPaymentModal(false);
      setIsSuccess(true);
    } catch (error) {
      console.error('Payment Error:', error);
      setPaymentError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // 🟢 ৪. লোডিং স্টেট ভিউ
  if (isLoadingCart) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 size={40} className="text-indigo-600 animate-spin mb-2" />
        <p className="text-slate-600 text-sm font-medium">Cart checking...</p>
      </div>
    );
  }

  // 🟢 ৫. অর্ডার সাকসেস ভিউ
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Placed Successfully!</h2>
          <p className="text-slate-600 text-sm mb-6">
            ধন্যবাদ! আপনার অর্ডারটি গ্রহণ করা হয়েছে।
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // 🟢 ৬. ফাঁকা কার্ট ভিউ
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <ShoppingBag size={64} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Your Cart is Empty</h2>
        <p className="text-slate-500 text-sm mb-6">চেকআউট করার জন্য প্রথমে কার্টে পণ্য যোগ করুন।</p>
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // 🟢 ৭. মূল চেকআউট পেজ UI
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-indigo-600 font-semibold">Dummy Payment</p>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Secure Checkout</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="text-slate-400 hover:text-slate-700 text-xl font-semibold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    name="mobile"
                    value={paymentForm.mobile}
                    onChange={handlePaymentInputChange}
                    placeholder="01700000000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">PIN</label>
                  <input
                    type="password"
                    name="pin"
                    value={paymentForm.pin}
                    onChange={handlePaymentInputChange}
                    placeholder="1234"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {paymentError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
                    {paymentError}
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                  <p><strong>Success test:</strong> enter any mobile number except 0000 and any PIN.</p>
                  <p className="mt-1"><strong>Fail test:</strong> enter <span className="font-bold">0000</span> as mobile number.</p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
                >
                  {isProcessingPayment ? 'Processing Payment...' : 'Pay Now'}
                </button>
              </form>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold text-lg border-b pb-3">
                <Truck className="text-indigo-600" size={22} />
                <h3>Shipping Information</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="shipping_name"
                    required
                    value={formData.shipping_name}
                    onChange={handleInputChange}
                    placeholder="আপনার পূর্ণ নাম"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="shipping_phone"
                      required
                      value={formData.shipping_phone}
                      onChange={handleInputChange}
                      placeholder="017XXXXXXXX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Delivery Area *</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Dhaka">Inside Dhaka (৳60)</option>
                      <option value="Outside Dhaka">Outside Dhaka (৳120)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Address *</label>
                  <textarea
                    name="shipping_address"
                    required
                    rows="2"
                    value={formData.shipping_address}
                    onChange={handleInputChange}
                    placeholder="বাসা নম্বর, রোড নম্বর, এলাকা"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold text-lg border-b pb-3">
                <CreditCard className="text-indigo-600" size={22} />
                <h3>Payment Method</h3>
              </div>
              <div className="p-3.5 border rounded-xl border-indigo-600 bg-indigo-50/30 flex items-center gap-3">
                <input type="radio" checked readOnly className="accent-indigo-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Cash on Delivery</p>
                  <p className="text-xs text-slate-500">পণ্য হাতে পেয়ে টাকা দিন।</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-3">Order Summary</h3>

              <div className="max-h-60 overflow-y-auto space-y-3 mb-4 pr-1">
                {cartItems.map((item, index) => (
                  <div key={item.id || index} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-100"
                      />
                      <div>
                        <p className="font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity || 1}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">
                      ৳{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="my-4 border-slate-100" />

              <div className="space-y-2 text-sm text-slate-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  <span className="font-semibold text-slate-800">৳{shippingCost}</span>
                </div>
                <hr className="my-2 border-slate-100" />
                <div className="flex justify-between text-base font-bold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-indigo-600">৳{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50"
              >
                {isSubmitting ? 'Processing Order...' : 'Confirm Order'}
              </button>

              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mt-4">
                <ShieldCheck size={16} />
                <span>Safe & Secure Checkout</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}