import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bus, Car, Filter, Loader2, MapPin, MessageCircle, Phone, Search, Star, Truck, Users, X, Route, Shield, ArrowRight
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { fetchTransports, logTransportContact } from "../../redux/slices/transportSlice";

const vehicleTypes = ["All", "taxi", "auto", "minivan", "tempo", "bus", "bike"];
const vehicleTypeLabels = {
  "All": "All",
  "taxi": "Taxi",
  "auto": "Auto",
  "minivan": "Mini Van",
  "tempo": "Tempo Traveller",
  "bus": "Bus",
  "bike": "Bike"
};

// Vehicle Icon Mapper
const getVehicleIcon = (type) => {
  switch (type) {
    case "bus": return Bus;
    case "taxi": return Car;
    case "minivan": case "tempo": return Truck;
    default: return Car;
  }
};

// Floating Particles Component
const FloatingParticles = () => {
  const [particles] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
    }))
  );

  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-br from-teal-300 to-cyan-400 opacity-40"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -30, -15, -40, 0],
            rotate: [0, 10, -10, 5, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
};

// Filter Modal Component
const FilterModal = ({ isOpen, onClose, filters, setFilters, resultCount, onReset }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Filter Transports</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Vehicle Type */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Vehicle Type</h3>
                <div className="flex flex-wrap gap-2">
                  {vehicleTypes.map((type, i) => (
                    <motion.button
                      key={type}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilters(prev => ({ ...prev, vehicleType: type }))}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                        filters.vehicleType === type
                          ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600'
                      }`}
                    >
                      {vehicleTypeLabels[type]}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <div className="h-px bg-slate-100" />

              {/* Seating Capacity */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Min. Seats Required</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 4, 8, 12].map(seats => (
                    <motion.button
                      key={seats}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFilters(prev => ({ ...prev, minSeats: seats }))}
                      className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                        filters.minSeats === seats
                          ? 'bg-teal-50 text-teal-700 border-teal-200 ring-1 ring-teal-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {seats}+
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <div className="h-px bg-slate-100" />

              {/* Availability */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Availability</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['All', 'Available Only'].map(opt => (
                    <motion.button
                      key={opt}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFilters(prev => ({ ...prev, availability: opt }))}
                      className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                        filters.availability === opt
                          ? 'bg-teal-50 text-teal-700 border-teal-200 ring-1 ring-teal-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <div className="h-px bg-slate-100" />

              {/* Verified Only */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-teal-600" />
                    <span className="font-semibold text-slate-700">Verified Providers Only</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={filters.verifiedOnly}
                    onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                </label>
              </motion.div>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 border-t border-slate-100 bg-slate-50"
            >
              <div className="flex gap-4">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onReset}
                  className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                  Reset
                </motion.button>
                <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={onClose}
                  className="flex-1 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-teal-200 transition-all">
                  Show {resultCount} Results
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Transport Card Component
const TransportCard = ({ transport, index, onContact }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const VehicleIcon = getVehicleIcon(transport.vehicleType);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const formatPrice = () => {
    if (transport.maxPrice) {
      return `₹${transport.minPrice} - ₹${transport.maxPrice}`;
    }
    return `₹${transport.minPrice}`;
  };

  const formatPriceType = (type) => {
    const types = {
      'per_trip': 'per trip',
      'per_day': 'per day',
      'per_km': 'per km',
      'per_seat': 'per seat'
    };
    return types[type] || type;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/40 rounded-3xl overflow-hidden border border-teal-100 shadow-xl shadow-teal-100/30 hover:border-teal-200 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-200/30"
    >
      {/* Hover Glow Effect */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 transition-opacity duration-300 rounded-3xl z-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(20, 184, 166, 0.15) 0%, transparent 50%)`,
          }}
        />
      )}

      {/* Image Section */}
      <div className="h-48 relative overflow-hidden">
        <img
          src={transport.vehicleImages?.[0] || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80"}
          alt={transport.vehicleName}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-3 py-1 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <VehicleIcon className="w-3.5 h-3.5 text-teal-600" />
            {vehicleTypeLabels[transport.vehicleType] || transport.vehicleType}
          </motion.span>
          {transport.isVerified && (
            <span className="px-2 py-1 bg-teal-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
              <Shield className="w-3 h-3" /> Verified
            </span>
          )}
        </div>

        {/* Availability Badge */}
        <div className="absolute bottom-4 left-4 z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
            transport.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>
            {transport.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-slate-700">{transport.averageRating?.toFixed(1) || '0.0'}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 relative z-10">
        {/* Provider Info */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={transport.owner?.profileImage || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"}
            alt={transport.owner?.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
          />
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
              {transport.owner?.name || 'Provider'}
            </h3>
            <p className="text-xs text-slate-500">{transport.totalContacts || 0} contacts</p>
          </div>
        </div>

        {/* Vehicle Name */}
        <h4 className="text-lg font-bold text-slate-800 mb-3">{transport.vehicleName}</h4>

        {/* Details Grid */}
        <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Route className="w-4 h-4 text-teal-500" />
            <span className="font-medium">{transport.route}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-teal-500" />
            <span>{transport.serviceArea}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="w-4 h-4 text-teal-500" />
            <span>{transport.seatingCapacity} seats</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {transport.features?.slice(0, 3).map((feature, i) => (
            <span key={i} className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">
              {feature}
            </span>
          ))}
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium">Price</p>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-slate-900">{formatPrice()}</span>
            </div>
            <p className="text-xs text-slate-500">{formatPriceType(transport.priceType)}</p>
          </div>

          <div className="flex gap-2">
            <motion.a
              href={`tel:${transport.phone}`}
              onClick={() => onContact(transport._id, 'call')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-teal-100 text-teal-600 rounded-xl hover:bg-teal-200 transition-colors"
            >
              <Phone className="w-5 h-5" />
            </motion.a>
            <motion.a
              href={`https://wa.me/${transport.whatsapp || transport.phone}`.replace(/\s/g, '')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onContact(transport._id, 'whatsapp')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
    </motion.div>
  );
};

// Main Component
export default function TransportBuddy() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  const { transports, transportsLoading, pagination } = useSelector((state) => state.transport);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    vehicleType: 'All',
    minSeats: 1,
    availability: 'All',
    verifiedOnly: false,
  });

  // Fetch transports on mount and when filters change
  useEffect(() => {
    const fetchData = async () => {
      dispatch(fetchTransports({
        getToken,
        filters: {
          search: searchQuery,
          vehicleType: filters.vehicleType,
          minSeats: filters.minSeats,
          availability: filters.availability === 'Available Only' ? 'true' : undefined,
          verifiedOnly: filters.verifiedOnly ? 'true' : undefined,
        }
      }));
    };

    const debounceTimer = setTimeout(fetchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [dispatch, getToken, searchQuery, filters]);

  const handleContact = (transportId, contactType) => {
    dispatch(logTransportContact({ getToken, transportId, contactType }));
  };

  const stats = [
    { icon: Car, value: pagination?.totalCount || transports.length || "0", label: "Transport Providers" },
    { icon: MapPin, value: "100+", label: "Destinations Covered" },
    { icon: Star, value: "4.7", label: "Average Rating" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 text-slate-900 relative overflow-hidden">
      {/* Global Styles */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #0d9488 0%, #06b6d4 25%, #14b8a6 50%, #06b6d4 75%, #0d9488 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        resultCount={transports.length}
        onReset={() => setFilters({ vehicleType: 'All', minSeats: 1, availability: 'All', verifiedOnly: false })}
      />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 pb-16 pt-12 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[2.5rem] shadow-2xl shadow-teal-500/20 mb-8"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] bg-cyan-300/30 rounded-full blur-3xl"
          />
          <FloatingParticles />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center z-10 mt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium mb-6"
          >
            <Car className="w-4 h-4" />
            <span>Find Local Transport</span>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 bg-green-400 rounded-full" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm"
          >
            Transport <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 to-white">Buddy</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-teal-50 max-w-2xl mx-auto text-lg leading-relaxed mb-8 font-medium"
          >
            Discover local taxis, mini vans, and buses. Connect directly with drivers for hassle-free travel at negotiable prices.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 md:gap-8 mb-10"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-3 px-5 py-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20"
              >
                <stat.icon className="w-5 h-5 text-cyan-200" />
                <div className="text-left">
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-teal-100">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="max-w-3xl mx-auto bg-white rounded-2xl p-2 shadow-xl shadow-teal-900/10 flex flex-col md:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by route, location, or vehicle..."
                className="w-full bg-transparent border-none rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="h-0.5 w-full md:w-0.5 md:h-12 bg-slate-100" />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFilterOpen(true)}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" /> Filter
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-20">
        {/* Results Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-between mb-8 px-2"
        >
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Available Transports</h2>
            <p className="text-slate-500 text-sm">Showing {transports.length} providers</p>
          </div>
        </motion.div>

        {/* Transport Grid */}
        {transportsLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full"
            />
          </div>
        ) : transports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Car className="w-8 h-8 text-slate-300" />
            </motion.div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No transports found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setSearchQuery(''); setFilters({ vehicleType: 'All', minSeats: 1, availability: 'All', verifiedOnly: false }); }}
              className="mt-6 text-teal-600 font-medium hover:underline"
            >
              Clear All Filters
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {transports.map((transport, index) => (
              <TransportCard key={transport._id} transport={transport} index={index} onContact={handleContact} />
            ))}
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 p-8 md:p-12 text-center shadow-2xl shadow-teal-500/30"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,white_25%,white_50%,transparent_50%,transparent_75%,white_75%)] bg-[length:60px_60px]" />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Are You a Transport Provider?
            </h2>
            <p className="text-teal-100 max-w-2xl mx-auto mb-8 text-lg">
              List your vehicle and reach thousands of travelers. No commission, no complex setup — just direct bookings.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/list-vehicle')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-teal-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <span>List Your Vehicle</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
