import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { cartItems = [] } = useContext(AppContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("access"); // আপনার টোকেন কি-নাম অনুযায়ী চেক করে নেবেন
      const response = await axios.get("http://127.0.0.1:8000/api/accounts/profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(response.data);
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      setError("প্রোফাইল তথ্য লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  // স্ট্যাটাস অনুযায়ী ব্যাজের কালার
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
        <p>{error}</p>
        <button
          onClick={fetchUserProfile}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ================= USER HEADER CARD ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* User Avatar */}
            <div className="w-20 h-20 bg-indigo-600 text-white font-bold text-3xl rounded-full flex items-center justify-center shadow-md uppercase">
              {profile?.username ? profile.username[0] : "U"}
            </div>
            
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {profile?.username}
              </h1>
              <p className="text-gray-500 text-sm mt-1">{profile?.email}</p>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {profile?.role === "customer" ? "Customer" : profile?.role || "User"}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 justify-around">
            <div className="text-center px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 min-w-[100px]">
              <span className="block text-xl font-bold text-indigo-600">
                {profile?.orders?.length || 0}
              </span>
              <span className="text-xs text-gray-500 font-medium">মোট অর্ডার</span>
            </div>
          </div>
        </div>

        {/* ================= TABS & NAVIGATION ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 flex">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 py-4 px-6 text-center text-sm font-semibold transition border-b-2 ${
                activeTab === "orders"
                  ? "border-indigo-600 text-indigo-600 bg-indigo-50/30"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              আমার অর্ডারসমূহ ({profile?.orders?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`flex-1 py-4 px-6 text-center text-sm font-semibold transition border-b-2 ${
                activeTab === "details"
                  ? "border-indigo-600 text-indigo-600 bg-indigo-50/30"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              প্রোফাইল ডিটেইলস
            </button>
          </div>

          <div className="p-6">
            {/* ================= TAB 1: ORDERS ================= */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                {!profile?.orders || profile.orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-base font-medium">আপনার কোনো অর্ডার পাওয়া যায়নি।</p>
                    <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
                      <button
                        onClick={() => navigate('/')}
                        className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
                      >
                        কেনাকাটা শুরু করুন
                      </button>
                      {cartItems.length > 0 && (
                        <button
                          onClick={() => navigate('/checkout')}
                          className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition"
                        >
                          চেকআউট করুন
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  profile.orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition bg-white"
                    >
                      {/* Order Header */}
                      <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">অর্ডার আইডি</p>
                          <p className="text-sm font-bold text-gray-800">#{order.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">তারিখ</p>
                          <p className="text-sm font-medium text-gray-700">
                            {new Date(order.created_at).toLocaleDateString("bn-BD", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">মোট টাকা</p>
                          <p className="text-sm font-bold text-indigo-600">৳{order.total}</p>
                        </div>
                        <div className="flex gap-2">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            অর্ডার: {order.status}
                          </span>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${
                              order.payment_status?.toLowerCase() === "paid"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-yellow-100 text-yellow-700 border-yellow-200"
                            }`}
                          >
                            পেমেন্ট: {order.payment_status}
                          </span>
                        </div>
                      </div>

                      {/* Order Items Table/List */}
                      <div className="p-6 divide-y divide-gray-100">
                        {order.items?.map((item) => (
                          <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {item.product_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                পরিমাণ: {item.quantity} × ৳{item.price}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-gray-700">
                              ৳{item.subtotal}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Info Footer */}
                      <div className="bg-gray-50/50 px-6 py-3 text-xs text-gray-500 border-t border-gray-100 flex justify-between items-center">
                        <span>
                          <strong>ঠিকানা:</strong> {order.shipping_address} ({order.shipping_phone})
                        </span>
                        <span>
                          <strong>শিপিং চার্জ:</strong> ৳{order.shipping_cost}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ================= TAB 2: USER DETAILS ================= */}
            {activeTab === "details" && (
              <div className="max-w-xl mx-auto space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">ইউজারনেম</p>
                    <p className="text-base font-semibold text-gray-800 mt-1">{profile?.username}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">ইমেইল ঠিকানা</p>
                    <p className="text-base font-semibold text-gray-800 mt-1">{profile?.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">একাউন্ট টাইপ / রোল</p>
                    <p className="text-base font-semibold text-gray-800 mt-1 capitalize">{profile?.role}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">ইউজার আইডি</p>
                    <p className="text-base font-semibold text-gray-800 mt-1">#{profile?.id}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;