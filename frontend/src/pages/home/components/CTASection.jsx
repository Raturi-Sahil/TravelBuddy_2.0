import { motion } from 'framer-motion';
import { ArrowRight, Mountain } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Image - Indian Mountain */}
      <motion.div
        initial={{ scale: 1.1 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=2400&q=80)' // Valley of Flowers, Uttarakhand
        }}
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-gray-900/50" />

      {/* Animated Decorative Elements */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px]"
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-semibold mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Mountain className="w-4 h-4 text-amber-400" />
          </motion.div>
          <span>Your Adventure Awaits in India</span>
        </motion.div>

        {/* Heading with 3D Animation */}
        <motion.h2
          initial={{ opacity: 0, y: 40, rotateX: -20 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.6, 0.01, 0.05, 0.95] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 tracking-tight leading-tight"
          style={{ transformStyle: 'preserve-3d' }}
        >
          Ready to Explore
          <motion.span
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 mt-2"
          >
            Incredible India?
          </motion.span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300/90 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
        >
          Join thousands of adventurers discovering ancient temples, majestic mountains, and vibrant cultures across the subcontinent.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-5 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/create-activity')}
            className="group relative px-10 py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white text-lg font-bold rounded-2xl shadow-2xl shadow-orange-500/30 overflow-hidden"
          >
            {/* Animated Shine Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />

            <span className="relative z-10 flex items-center justify-center gap-3">
              Create Your First Activity
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/guides')}
            className="group px-10 py-5 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white text-lg font-bold rounded-2xl hover:bg-white/20 hover:border-white/50 transition-all flex items-center justify-center gap-3"
          >
            <span>Find a Local Guide</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>

        {/* Trust Badges with Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/60 text-sm"
        >
          {[
            { color: 'bg-green-400', text: '50,000+ Indian Travelers' },
            { color: 'bg-amber-400', text: '4.9 Star Rating' },
            { color: 'bg-blue-400', text: '29 States Covered' }
          ].map((badge, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.8 + idx * 0.1 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                className={`w-2 h-2 rounded-full ${badge.color}`}
              />
              <span>{badge.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
