import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
  baseURL: API_BASE_URL.replace(/\/$/, ''), // শেষের / তুলে দেয়া হলো যাতে double-slash না হয়
});

// যেসব API এন্ডপয়েন্টে Authorization হেডার পাঠানো যাবে না (Public Endpoints)
const publicEndpoints = ['home', 'products', 'categories'];

// Request Interceptor: প্রতিটা API রিকোয়েস্ট যাওয়ার আগে টোকেন চেক করবে
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('access');

    // রিকোয়েস্টের URL টি পাবলিক লিস্টে আছে কিনা চেক করা
    const isPublicEndpoint = publicEndpoints.some((url) =>
      config.url.endsWith(url)
    );

    // টোকেন থাকলে এবং এন্ডপয়েন্টটি পাবলিক না হলেই কেবল হেডার যুক্ত হবে
    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // পাবলিক এন্ডপয়েন্টের জন্য কোনো Authorization হেডার থাকবে না
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;