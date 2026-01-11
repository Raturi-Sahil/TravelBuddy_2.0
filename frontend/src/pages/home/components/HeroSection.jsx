import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Map, MapPin, Mountain, Sparkles, Users, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const heroSlides = [
  {
    title: 'Majestic Himalayas',
    subtitle: 'Trek through the roof of the world. Experience breathtaking peaks, ancient monasteries, and untouched wilderness.',
    location: 'Spiti Valley • Himachal Pradesh',
    travelers: '3.2k trekkers active',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2400&q=80',
    accent: 'from-amber-500 to-orange-600'
  },
  {
    title: 'Enchanting Ladakh',
    subtitle: 'Discover the land of high passes. Pristine lakes, rugged mountains, and spiritual monasteries await.',
    location: 'Pangong Lake • Ladakh',
    travelers: '2.1k adventurers nearby',
    image: 'https://images.unsplash.com/photo-1614458428857-0ef04eb3d0ac?auto=format&fit=crop&w=2400&q=80',
    accent: 'from-cyan-500 to-blue-600'
  },
  {
    title: 'Golden Rajasthan',
    subtitle: 'Explore majestic forts, vibrant deserts, and royal heritage of the land of kings.',
    location: 'Jaisalmer • Rajasthan',
    travelers: '1.8k explorers',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=2400&q=80',
    accent: 'from-yellow-500 to-amber-600'
  },
  {
    title: 'Serene Kerala',
    subtitle: 'Cruise through tranquil backwaters, lush tea gardens, and pristine beaches of God\'s own country.',
    location: 'Munnar • Kerala',
    travelers: '1.5k travelers exploring',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2400&q=80',
    accent: 'from-emerald-500 to-teal-600'
  },
  {
    title: 'Sacred Varanasi',
    subtitle: 'Experience the spiritual heart of India. Ancient ghats, mystical rituals, and timeless traditions.',
    location: 'Ganges • Varanasi',
    travelers: '2.4k pilgrims',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=2400&q=80',
    accent: 'from-orange-500 to-red-600'
  }
];

// Text animation variants
const titleVariants = {
  hidden: { opacity: 0, y: 100, rotateX: -30 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.8, ease: [0.6, 0.01, 0.05, 0.95] }
  },
  exit: {
    opacity: 0,
    y: -50,
    transition: { duration: 0.4 }
  }
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.2, ease: "easeOut" }
  },
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

const buttonVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, delay: 0.4 }
  },
  hover: {
    scale: 1.05,
    y: -5,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.95 }
};

const floatingVariants = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const HeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const currentSlide = heroSlides[activeSlide];

  return (
    <section className="relative h-screen flex items-center overflow-hidden perspective-1000">
      {/* Background Images with Parallax Effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.div
            animate={{ scale: [1, 1.08], rotate: [0, 0.5] }}
            transition={{ duration: 20, ease: "linear" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentSlide.image})` }}
          />
          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Animated Floating Elements */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-32 right-20 w-40 h-40 bg-gradient-to-br from-amber-500/30 to-orange-500/20 rounded-full blur-3xl hidden lg:block"
      />
      <motion.div
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: '2s' }}
        className="absolute bottom-40 left-20 w-48 h-48 bg-gradient-to-br from-blue-500/30 to-cyan-500/20 rounded-full blur-3xl hidden lg:block"
      />

      {/* 3D Floating Cards */}
      <motion.div
        initial={{ opacity: 0, x: 100, rotateY: -20 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute top-40 right-10 lg:right-32 hidden lg:block"
      >
        <motion.div
          whileHover={{ scale: 1.05, rotateY: 10 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-bold text-white">LIVE NOW</span>
          </div>
          <p className="text-white/80 text-sm">156 travelers joined<br/>activities this hour</p>
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            className="max-w-3xl"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-medium mb-8 shadow-lg"
            >
              <div className="flex items-center gap-1.5">
                <Mountain className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-semibold">INDIA</span>
              </div>
              <div className="w-px h-4 bg-white/30" />
              <span className="text-white/90">Incredible India Adventures 2026</span>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </motion.div>

            {/* Title with 3D Effect */}
            <motion.h1
              variants={titleVariants}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[1.1] tracking-tight"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.span
                className="block"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {currentSlide.title.split(' ')[0]}
              </motion.span>
              <motion.span
                className={`block text-transparent bg-clip-text bg-gradient-to-r ${currentSlide.accent}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {currentSlide.title.split(' ').slice(1).join(' ')}
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={subtitleVariants}
              className="text-lg sm:text-xl md:text-2xl text-gray-200/90 mb-10 leading-relaxed max-w-2xl font-light"
            >
              {currentSlide.subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => navigate('/activities')}
                className={`group px-8 py-4 bg-gradient-to-r ${currentSlide.accent} text-white rounded-2xl font-bold text-lg shadow-2xl transition-all flex items-center gap-3`}
              >
                <span>Start Adventure</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.button>

              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => navigate('/map')}
                className="group px-8 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/20 hover:border-white/40 transition-all flex items-center gap-3"
              >
                <Map className="w-5 h-5" />
                <span>Explore Map</span>
              </motion.button>
            </motion.div>

            {/* Location & Travelers Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex flex-wrap items-center gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Location</p>
                  <p className="text-white font-bold">{currentSlide.location}</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Active Now</p>
                  <p className="text-white font-bold">{currentSlide.travelers}</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Navigation with Animation */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        {heroSlides.map((slide, i) => (
          <motion.button
            key={i}
            onClick={() => setActiveSlide(i)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="group relative"
          >
            <motion.div
              className="h-2 rounded-full bg-white/30"
              animate={{
                width: i === activeSlide ? 64 : 16,
                backgroundColor: i === activeSlide ? '#fff' : 'rgba(255,255,255,0.3)'
              }}
              transition={{ duration: 0.3 }}
            />
            {i === activeSlide && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium text-white/70 whitespace-nowrap"
              >
                {slide.location.split(' • ')[1]}
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12 right-8 hidden lg:flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white/50"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 bg-white/50 rounded-full"
            />
          </div>
        </motion.div>
        <span className="text-xs text-white/40 font-medium tracking-widest">SCROLL</span>
      </motion.div>
    </section>
  );
};

export default HeroSection;
