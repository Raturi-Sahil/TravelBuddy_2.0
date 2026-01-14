// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Activity, ChevronRight, Globe, Map, MapPin, Star, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CurrentLocationMap from '../../../components/location/CurrentLocation';

const stats = [
  { value: '50K+', label: 'Active Travelers', icon: Users },
  { value: '29', label: 'Indian States', icon: Globe },
  { value: '10K+', label: 'Activities', icon: Activity },
  { value: '4.9', label: 'User Rating', icon: Star },
];

const MapSection = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  return (
    <section className="py-28 px-4 bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/20 rounded-full blur-[100px]"
      />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="lg:w-1/2 space-y-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold"
          >
            <Map className="w-4 h-4" />
            Interactive Map
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
          >
            Discover Travelers & <br />
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              Activities Across India
            </motion.span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-gray-600 leading-relaxed"
          >
            Our real-time interactive map shows you nearby travelers, trending hotspots, local activities, and verified guides. From Kashmir to Kanyakumari, never miss an opportunity to connect.
          </motion.p>

          {/* Stats Grid with Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-4 bg-gray-50 rounded-2xl cursor-default"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: idx * 0.5 }}
                >
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                </motion.div>
                <h4 className="text-2xl font-bold text-gray-900">{stat.value}</h4>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/map')}
              className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              Open Live Map <ChevronRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/activities')}
              className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              Browse Activities
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right - Map */}
        <motion.div
          initial={{ opacity: 0, x: 50, rotateY: -10 }}
          whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="lg:w-1/2 w-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <motion.div
            whileHover={{ scale: 1.02, rotateY: 5 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-gray-100"
          >
            <div className="h-[500px] w-full bg-gray-200 relative">
              {currentLocation ? (
                <CurrentLocationMap lat={currentLocation.lat} lng={currentLocation.lng} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                    </motion.div>
                    <p className="font-semibold text-gray-600">Loading Location...</p>
                    <p className="text-sm text-gray-400 mt-1">Please allow location access</p>
                  </div>
                </div>
              )}

              {/* Floating Live Update Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.05 }}
                className="absolute top-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-xl max-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2.5 h-2.5 rounded-full bg-green-500"
                  />
                  <span className="text-xs font-bold text-gray-700">LIVE UPDATES</span>
                </div>
                <p className="text-xs text-gray-500">23 travelers joined activities in India this hour.</p>
              </motion.div>

              {/* Floating Trending Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
                whileHover={{ scale: 1.05 }}
                className="absolute bottom-6 left-6 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white"
                  >
                    <TrendingUp className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <p className="text-xs font-bold text-gray-700">Trending Now</p>
                    <p className="text-xs text-gray-500">Ladakh, Goa, Kerala</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default MapSection;
