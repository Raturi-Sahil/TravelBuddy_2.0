import { motion } from 'framer-motion';
import { Activity, BookOpen, Bot, Camera, ChevronRight, Compass, MessageCircle, Sparkles, Wallet } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const services = [
  {
    icon: <Activity className="h-7 w-7" />,
    title: "Travel Activities",
    desc: "Join or create exciting travel activities across India. From Himalayan treks to desert safaris.",
    color: "from-orange-500 to-amber-500",
    shadowColor: "shadow-orange-500/20",
    path: "/activities",
    stats: "500+ Activities",
    popular: true,
    backgroundImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80"
  },
  {
    icon: <Compass className="h-7 w-7" />,
    title: "Local Guides",
    desc: "Connect with verified local guides who know India's hidden gems and secret trails.",
    color: "from-emerald-500 to-teal-500",
    shadowColor: "shadow-emerald-500/20",
    path: "/guides",
    stats: "200+ Guides",
    popular: false,
    backgroundImage: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&q=80"
  },
  {
    icon: <Bot className="h-7 w-7" />,
    title: "AI Trip Planner",
    desc: "Let our AI create personalized India itineraries based on your preferences and budget.",
    color: "from-violet-500 to-purple-500",
    shadowColor: "shadow-violet-500/20",
    path: "/ai-buddy",
    stats: "Smart Planning",
    popular: true,
    backgroundImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80"
  },
  {
    icon: <Camera className="h-7 w-7" />,
    title: "Traveler Posts",
    desc: "Share your India travel experiences and discover inspiring stories from fellow adventurers.",
    color: "from-rose-500 to-pink-500",
    shadowColor: "shadow-rose-500/20",
    path: "/user-posts",
    stats: "1K+ Stories",
    popular: false,
    backgroundImage: "https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?w=800&q=80"
  },
  {
    icon: <BookOpen className="h-7 w-7" />,
    title: "Travel Articles",
    desc: "Read insightful articles about Indian destinations, tips, and expert travel guides.",
    color: "from-sky-500 to-blue-500",
    shadowColor: "shadow-sky-500/20",
    path: "/read-article",
    stats: "Expert Tips",
    popular: false,
    backgroundImage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80"
  },
  {
    icon: <Wallet className="h-7 w-7" />,
    title: "Split Expenses",
    desc: "Easily split and track expenses with your travel group in real-time.",
    color: "from-amber-500 to-yellow-500",
    shadowColor: "shadow-amber-500/20",
    path: "/split-expenses",
    stats: "Easy Splits",
    popular: false,
    backgroundImage: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&q=80"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, rotateX: -10 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, 0.01, 0.05, 0.95]
    }
  }
};

const ServicesSection = () => {
  const [hoveredService, setHoveredService] = useState(null);
  const navigate = useNavigate();

  return (
    <section className="py-28 px-4 bg-gradient-to-b from-white via-slate-50/50 to-white relative overflow-hidden">
      {/* Animated Background Decorations */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-20 left-0 w-72 h-72 bg-gradient-to-br from-orange-200/30 to-amber-200/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        className="absolute bottom-20 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/20 rounded-full blur-3xl"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 text-amber-700 text-sm font-semibold mb-6 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Everything You Need</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight"
          >
            Your Complete India
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 mt-2"
            >
              Travel Platform
            </motion.span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            From planning to exploring, we provide all the tools and services to make your Indian adventure unforgettable.
          </motion.p>
        </motion.div>

        {/* Services Grid with Staggered Animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              onMouseEnter={() => setHoveredService(idx)}
              onMouseLeave={() => setHoveredService(null)}
              onClick={() => navigate(service.path)}
              whileHover={{
                y: -12,
                transition: { duration: 0.3 }
              }}
              className="relative rounded-[2rem] cursor-pointer transition-all duration-500 group overflow-hidden min-h-[320px] shadow-xl hover:shadow-2xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={service.backgroundImage}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20 group-hover:from-black/80 group-hover:via-black/40 transition-all duration-500" />
                {/* Color Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
              </div>

              {/* Popular Badge */}
              {service.popular && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-6 right-6 z-10"
                >
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-amber-500 rounded-full shadow-lg">
                    Popular
                  </span>
                </motion.div>
              )}

              {/* Card Content */}
              <div className="relative h-full p-8 flex flex-col justify-end z-10">
                {/* Icon with 3D Animation */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-5 shadow-lg backdrop-blur-sm`}
                >
                  {service.icon}
                </motion.div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-lg">{service.title}</h3>

                {/* Description */}
                <p className="text-white/85 mb-5 leading-relaxed text-sm drop-shadow">{service.desc}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <span className="text-sm font-semibold text-white/80 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">{service.stats}</span>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-1 text-sm font-bold text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <span>Explore</span>
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-gray-500 mb-6">Can't find what you're looking for?</p>
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/ai-buddy')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors group"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Ask AI Buddy</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
