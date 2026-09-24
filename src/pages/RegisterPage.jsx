import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const payload = {
        username: data.username,
        email: data.email,
        password: data.password,
        role: 'ADMIN', // জ্যাঙ্গো Serializer-এর চাহিদানুযায়ী role পাঠানো হচ্ছে
      };

      await axios.post('http://127.0.0.1:8000/api/accounts/register/', payload);

      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err.response?.data);

      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          // ব্যাকএন্ডের প্রথম ফিল্ডের এরর মেসেজটি সুন্দরভাবে এক্সট্র্যাক্ট করা
          const field = Object.keys(errorData)[0];
          const message = Array.isArray(errorData[field]) ? errorData[field][0] : errorData[field];
          setServerError(`${field.toUpperCase()}: ${message}`);
        } else {
          setServerError(errorData);
        }
      } else {
        setServerError('Server problem, please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <UserPlus size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
          <p className="text-sm text-slate-500 mt-1">Please complete registration</p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl text-center font-medium">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">User name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="john_doe"
                {...register('username', {
                  required: 'User name is mandatory',
                  minLength: { value: 3, message: 'Must be at least 3 characters' },
                })}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                  errors.username ? 'border-rose-500' : 'border-slate-200'
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            {errors.username && <p className="text-rose-500 text-xs mt-1">{errors.username.message}</p>}
          </div>

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
                    message: 'Enter a valid email format',
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
                  minLength: { value: 6, message: 'Must be at least 6 characters' },
                })}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                  errors.password ? 'border-rose-500' : 'border-slate-200'
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Please confirm password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                  errors.confirmPassword ? 'border-rose-500' : 'border-slate-200'
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            {errors.confirmPassword && <p className="text-rose-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">
            Login please
          </Link>
        </p>
      </div>
    </div>
  );
}