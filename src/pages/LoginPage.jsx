import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    try {
      // 🟢 ব্যাকএন্ডের চাহিদামতো username-এর বদলে email পাঠানো হচ্ছে
      const payload = {
        email: data.email,
        password: data.password,
      };

      const response = await axios.post('http://127.0.0.1:8000/api/token/', payload);

      // LocalStorage-এ Tokens সেভ করা
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);

      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      alert('Login successful!');
      navigate('/profile');
    } catch (err) {
      console.error('Login error details:', err.response?.data);

      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const firstKey = Object.keys(errorData)[0];
          const firstErrorMsg = Array.isArray(errorData[firstKey]) ? errorData[firstKey][0] : errorData[firstKey];
          setServerError(`${firstKey.toUpperCase()}: ${firstErrorMsg}`);
        } else {
          setServerError(errorData);
        }
      } else {
        setServerError('Server problem, try again later.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <LogIn size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-sm text-slate-500 mt-1">Please enter your details to sign in</p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl text-center font-medium">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input
                type="email"
                placeholder="example@mail.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Enter a valid email address',
                  },
                })}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                  errors.email ? 'border-rose-500' : 'border-slate-200'
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                })}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                  errors.password ? 'border-rose-500' : 'border-slate-200'
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-bold hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}