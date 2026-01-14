import { ArrowRight, BookOpen, Camera, Compass, PenTool, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const contentCards = [
  {
    icon: Camera,
    title: "Create Post",
    desc: "Share stunning photos and stories from your Indian adventures with the global community.",
    path: "/upload-post",
    gradient: "from-pink-500 to-rose-600",
    shadowColor: "shadow-pink-500/20",
    buttonText: "Start Posting",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80" // Taj Mahal
  },
  {
    icon: BookOpen,
    title: "Write Article",
    desc: "Share your travel expertise, hidden gems, and detailed guides about incredible India.",
    path: "/upload-article",
    gradient: "from-blue-500 to-indigo-600",
    shadowColor: "shadow-blue-500/20",
    buttonText: "Start Writing",
    image: "https://images.unsplash.com/photo-1506038634487-60a69ae4b7b1?auto=format&fit=crop&w=800&q=80" // Goa Beach
  },
  {
    icon: Compass,
    title: "Become a Guide",
    desc: "Share your local knowledge of India's treasures. Earn by guiding fellow travelers.",
    path: "/guide-profile-setup",
    gradient: "from-emerald-500 to-teal-600",
    shadowColor: "shadow-emerald-500/20",
    buttonText: "Get Started",
    image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?auto=format&fit=crop&w=800&q=80" // Kerala Backwaters
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, rotateX: -15 },
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

const ContentCreationSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-28 px-4 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background Decorations */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-200/40 to-rose-200/30 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-200/40 to-indigo-200/30 rounded-full blur-[100px]"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200/50 text-rose-700 text-sm font-semibold mb-6 shadow-sm"
          >
            <PenTool className="w-4 h-4" />
            <span>Content Creator</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight"
          >
            Share Your Epic
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 mt-2"
            >
              India Stories
            </motion.span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Inspire others with your adventures across Incredible India. Create posts, write articles, and build your travel legacy.
          </motion.p>
        </motion.div>

        {/* Content Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {contentCards.map((card, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{
                y: -12,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              onClick={() => navigate(card.path)}
              className={`group relative bg-white rounded-[2rem] overflow-hidden cursor-pointer shadow-xl ${card.shadowColor} hover:shadow-2xl transition-shadow duration-500`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Image Header */}
              <div className="relative h-52 overflow-hidden">
                <motion.img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.6 }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${card.gradient} opacity-50`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Floating Icon */}
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className={`absolute bottom-4 left-6 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/30`}
                >
                  <card.icon className="w-7 h-7" />
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{card.title}</h3>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-full"
                  >
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-semibold text-amber-700">Popular</span>
                  </motion.div>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">{card.desc}</p>

                <motion.div
                  className={`flex items-center gap-2 font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}
                  whileHover={{ x: 5 }}
                >
                  <span>{card.buttonText}</span>
                  <ArrowRight className="w-4 h-4 text-rose-500" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ContentCreationSection;
