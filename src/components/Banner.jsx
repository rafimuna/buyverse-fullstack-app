import React from 'react';
import { useNavigate } from 'react-router-dom';
// Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Swiper modules
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { motion } from 'framer-motion'; // 👈 ১. Framer Motion ইমপোর্ট করা হলো

// Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const BACKEND_URL = 'http://127.0.0.1:8000';
const DEFAULT_BANNER_IMG = 'https://picsum.photos/1200/500';

export default function Banner({ banners = [] }) {
  const navigate = useNavigate();

  // যদি কোনো ব্যানার ডাটা না থাকে
  if (!banners || banners.length === 0) return null;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return DEFAULT_BANNER_IMG;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${BACKEND_URL}${imagePath}`;
  };

  // 👈 ২. অ্যানিমেশন ভ্যারিয়েন্ট (Staggered Animation)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // একটি এলিমেন্টের পর আরেকটি সিকোয়েন্স অনুযায়ী অ্যানিমেট হবে
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="my-6 rounded-3xl overflow-hidden shadow-xl">
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 3500, // ৩.৫ সেকেন্ড পর পর স্লাইড চেঞ্জ হবে
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper rounded-3xl"
      >
        {banners.map((slide) => (
          <SwiperSlide key={slide.id}>
            {/* SwiperSlide-এর { isActive } স্টেট ব্যবহার করে প্রতিবার স্লাইড চেঞ্জে অ্যানিমেশন ট্রিগার করা হচ্ছে */}
            {({ isActive }) => (
              <div className="relative w-full overflow-hidden bg-slate-900 text-white min-h-[300px] sm:min-h-[380px] flex items-center">
                {/* Background Image - 👈 ৩. জুম-ইন অ্যানিমেশন */}
                <motion.img
                  initial={{ scale: 1 }}
                  animate={{ scale: isActive ? 1.08 : 1 }}
                  transition={{ duration: 4, ease: 'easeOut' }}
                  src={getImageUrl(slide.image)}
                  alt={slide.title || 'Banner Image'}
                  className="absolute inset-0 w-full h-full object-cover opacity-50 z-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_BANNER_IMG;
                  }}
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent z-10" />

                {/* Text Content - 👈 ৪. অ্যানিমেটেড কন্টেইনার */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate={isActive ? 'visible' : 'hidden'} // স্লাইড অ্যাক্টিভ হলে অ্যানিমেশন স্টার্ট হবে
                  className="relative z-20 p-8 sm:p-14 max-w-xl text-left"
                >
                  {/* Badge */}
                  <motion.span
                    variants={itemVariants}
                    className="inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-semibold uppercase tracking-wider rounded-full mb-3"
                  >
                    Special Offer
                  </motion.span>

                  {/* Title */}
                  <motion.h1
                    variants={itemVariants}
                    className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 text-white"
                  >
                    {slide.title}
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    variants={itemVariants}
                    className="text-slate-200 text-sm sm:text-base mb-6 line-clamp-2"
                  >
                    {slide.subtitle}
                  </motion.p>

                  {/* Button with Click/Hover Feedback */}
                  <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }} // হোভারে একটু বড় হবে
                    whileTap={{ scale: 0.95 }}  // ক্লিকে একটু ছোট হবে
                    onClick={() => {
                      const keyword = slide.title || slide.subtitle || 'products';
                      navigate(`/search?q=${encodeURIComponent(keyword)}`);
                    }}
                    className="bg-white text-slate-900 hover:bg-indigo-600 hover:text-white font-bold px-6 py-3 rounded-xl transition text-sm shadow-lg cursor-pointer"
                  >
                    Shop Now
                  </motion.button>
                </motion.div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}