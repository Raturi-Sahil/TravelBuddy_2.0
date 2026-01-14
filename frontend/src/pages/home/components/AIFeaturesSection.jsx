import { ArrowRight, Bot, Compass, CreditCard, Plane, Sparkles, Sun, Wand2 } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const aiFeatures = [
  {
    icon: <Plane className="h-6 w-6" />,
    title: "Trip Planner",
    desc: "AI-powered complete India trip planning with day-by-day itineraries",
    path: "/ai-trip-planner",
    gradient: "from-blue-500 to-cyan-400",
    backgroundImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80"
  },
  {
    icon: <Compass className="h-6 w-6" />,
    title: "Local Guide AI",
    desc: "Virtual guide with insider knowledge for any Indian destination",
    path: "/ai-local-guide",
    gradient: "from-purple-500 to-pink-400",
    backgroundImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80"
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "Package Planner",
    desc: "Budget-optimized travel packages for India tours",
    path: "/ai-package-planner",
    gradient: "from-orange-500 to-red-400",
    backgroundImage: "https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=600&q=80"
  },
  {
    icon: <Sun className="h-6 w-6" />,
    title: "Weather Planner",
    desc: "Monsoon & weather-based trip suggestions across India",
    path: "/ai-weather-planner",
    gradient: "from-teal-500 to-green-400",
    backgroundImage: "https://images.unsplash.com/photo-1504253163759-c23fccaebb55?w=600&q=80"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.6, 0.01, 0.05, 0.95]
    }
  }
};

const AIFeaturesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-28 px-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

        {/* Animated Floating Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
            y: [0, -20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.2, 0.3, 0.2],
            y: [0, 20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]"
        />

        {/* Animated Grid Pattern */}
        <motion.div
          animate={{ opacity: [0.02, 0.04, 0.02] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"
        />
      </div>

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
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white text-sm font-semibold mb-8 shadow-lg"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
            >
              <Wand2 className="w-4 h-4" />
            </motion.div>
            <span className="text-white/90">Powered by Advanced AI</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
            </motion.div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight"
          >
            Your Intelligent
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 mt-2"
            >
              India Travel Assistant
            </motion.span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-300/90 max-w-2xl mx-auto leading-relaxed"
          >
            Let artificial intelligence craft your perfect Indian adventure, discover hidden temples, and optimize every moment.
          </motion.p>
        </motion.div>

        {/* AI Features Grid with Staggered Animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {aiFeatures.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              onClick={() => navigate(feature.path)}
              whileHover={{
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="group cursor-pointer"
            >
              <div className="relative rounded-3xl border border-white/[0.08] hover:border-white/20 transition-all duration-500 h-full overflow-hidden min-h-[280px]">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={feature.backgroundImage}
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 group-hover:from-black/85 group-hover:via-black/50 transition-all duration-500" />
                  {/* Color Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-30 group-hover:opacity-40 transition-opacity duration-500`} />
                </div>

                {/* Card Content */}
                <div className="relative p-7 h-full flex flex-col justify-end z-10">
                  {/* Animated Icon */}
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    transition={{ duration: 0.3 }}
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4 shadow-lg backdrop-blur-sm`}
                  >
                    {feature.icon}
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">{feature.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-4 drop-shadow">{feature.desc}</p>

                  {/* CTA */}
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2 text-white text-sm font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full w-fit hover:bg-white/30 transition-colors"
                  >
                    <span>Try Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main CTA with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/ai-buddy')}
            className="group relative px-10 py-5 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-purple-500/25 overflow-hidden inline-flex items-center gap-3"
          >
            {/* Animated Shine Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />

            <Bot className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Open AI Buddy Hub</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5 relative z-10" />
            </motion.div>
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-gray-500 text-sm mt-6"
          >
            No credit card required • Free to try
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default AIFeaturesSection;
