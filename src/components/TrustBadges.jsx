// src/components/TrustBadges.jsx
import React from 'react';
// Lucide icons বা React Icons ব্যবহার করতে পারেন (যেমন: lucide-react)
import { Truck, ShieldCheck, RefreshCw, CreditCard } from 'lucide-react';

const trustData = [
  {
    id: 1,
    icon: <Truck className="w-7 h-7 text-indigo-600" />,
    title: 'Fast Shipping',
    description: 'All over Bangladesh',
  },
  {
    id: 2,
    icon: <ShieldCheck className="w-7 h-7 text-indigo-600" />,
    title: '100% Authentic',
    description: 'Guaranteed quality',
  },
  {
    id: 3,
    icon: <RefreshCw className="w-7 h-7 text-indigo-600" />,
    title: '7-Day Return',
    description: 'Easy exchange policy',
  },
  {
    id: 4,
    icon: <CreditCard className="w-7 h-7 text-indigo-600" />,
    title: 'Cash on Delivery',
    description: 'Pay on receiving',
  },
];

const TrustBadges = () => {
  return (
    <section className="bg-slate-50 py-10 my-8 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustData.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md"
            >
              <div className="p-3 bg-indigo-50 rounded-lg shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;