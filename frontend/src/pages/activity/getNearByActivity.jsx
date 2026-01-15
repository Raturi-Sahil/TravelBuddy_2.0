import { useAuth } from "@clerk/clerk-react";
import { Autocomplete } from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, ChevronLeft, ChevronRight, Clock, Filter, Heart, Loader2, MapPin, Search, Star, Users, X, Zap
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useGoogleMaps } from "../../context/useGoogleMaps";
import ReverseGeocode from "../../helpers/reverseGeoCode";
import { fetchActivities } from "../../redux/slices/ActivitySlice";

// Component to fetch and display address from coordinates
const AddressDisplay = ({ location }) => {
  const hasDirectAddress = Boolean(location?.address);
  const [fetchedAddress, setFetchedAddress] = useState(null);

  useEffect(() => {
    if (hasDirectAddress) return;
    let isMounted = true;
    const fetchAddress = async () => {
      if (location?.coordinates && location.coordinates.length === 2) {
        const lng = location.coordinates[0];
        const lat = location.coordinates[1];
        try {
          const result = await ReverseGeocode({ lat, lng });
          if (isMounted) setFetchedAddress(result);
        } catch {
          if (isMounted) setFetchedAddress("Location text unavailable");
        }
      } else {
        if (isMounted) setFetchedAddress("Location unspecified");
      }
    };
    fetchAddress();
    return () => { isMounted = false; };
  }, [location, hasDirectAddress]);

  const displayAddress = hasDirectAddress ? location.address : fetchedAddress || "Loading location...";
  return <span className="truncate">{displayAddress}</span>;
};

// Helper to calculate status
const getActivityStatus = (current, max) => {
  const spotsLeft = max - current;
  if (spotsLeft <= 0) return { type: 'full', text: 'Full', color: 'bg-red-500 text-white' };
  if (spotsLeft <= 3) return { type: 'limited', text: `${spotsLeft} spots left`, color: 'bg-amber-100 text-amber-800' };
  return { type: 'open', text: 'Open', color: 'bg-emerald-100 text-emerald-800' };
};

const ImageSlider = ({ photos }) => {
  const [idx, setIdx] = useState(0);
  const validPhotos = Array.isArray(photos) ? photos.filter(p => p) : [];

  if (!validPhotos.length) return <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400"><MapPin /></div>;

  return (
    <div className="relative h-full w-full group">
      <img src={validPhotos[idx]} alt="Activity" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />
      {validPhotos.length > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); setIdx((p) => p > 0 ? p - 1 : validPhotos.length - 1)}}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 text-slate-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all"
          >
            <ChevronLeft size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); setIdx((p) => (p + 1) % validPhotos.length)}}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 text-slate-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all"
          >
            <ChevronRight size={16} />
          </motion.button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {validPhotos.map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: i === idx ? 12 : 6 }}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const FilterModal = ({ isOpen, onClose, filters, setFilters, resultCount, onReset }) => {
  const { isLoaded } = useGoogleMaps();
  const autocompleteRef = useRef(null);

  const onAutocompleteLoad = (autocomplete) => { autocompleteRef.current = autocomplete; };
  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place) {
      const address = place.formatted_address || place.name;
      setFilters(prev => ({ ...prev, location: address }));
    }
  };

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
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <h2 className="text-xl font-bold text-slate-900">Filters</h2>
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
              {/* Location Search */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Location</h3>
                {isLoaded ? (
                  <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search city, area..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-slate-700 font-medium transition-all"
                        value={filters.location}
                        onChange={(e) => setFilters(prev => ({...prev, location: e.target.value}))}
                      />
                    </div>
                  </Autocomplete>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-sm">Loading Map Search...</div>
                )}
              </motion.div>

              <div className="h-px bg-slate-100" />

              {/* Category Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Adventure', 'Culture', 'Food', 'Sports', 'Art', 'Music', 'Tech'].map((cat, i) => (
                    <motion.button
                      key={cat}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilters(prev => ({...prev, category: cat}))}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                        filters.category === cat
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600'
                      }`}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <div className="h-px bg-slate-100" />

              {/* Price Range */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Price Range</h3>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input type="number" placeholder="Min" value={filters.minPrice}
                      onChange={(e) => setFilters(prev => ({...prev, minPrice: e.target.value}))}
                      className="w-full pl-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium" />
                  </div>
                  <span className="text-slate-400 font-medium">to</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input type="number" placeholder="Max" value={filters.maxPrice}
                      onChange={(e) => setFilters(prev => ({...prev, maxPrice: e.target.value}))}
                      className="w-full pl-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium" />
                  </div>
                </div>
              </motion.div>

              <div className="h-px bg-slate-100" />

              {/* Gender */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Gender Preference</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['Any', 'Male', 'Female'].map(g => (
                    <motion.button
                      key={g}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFilters(prev => ({...prev, gender: g}))}
                      className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                        filters.gender === g
                          ? 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {g}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <div className="h-px bg-slate-100" />

              {/* Date */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Date</h3>
                <input type="date" value={filters.date}
                  onChange={(e) => setFilters(prev => ({...prev, date: e.target.value}))}
                  className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-slate-700 font-medium" />
              </motion.div>
            </div>

            {/* Footer Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-6 border-t border-slate-100 bg-slate-50"
            >
              <div className="flex gap-4">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onReset}
                  className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                  Reset
                </motion.button>
                <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={onClose}
                  className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all">
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

// Floating particles component
const FloatingParticles = () => {
  const [particles] = useState(() =>
    Array.from({ length: 15 }, (_, i) => ({
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
          className="absolute rounded-full bg-gradient-to-br from-amber-300 to-orange-400 opacity-40"
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

export default function ActivityNearMe() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { activities, isLoading } = useSelector((state) => state.activity);
  const { profile: currentUser } = useSelector((state) => state.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [filters, setFilters] = useState({
    category: 'All', minPrice: '', maxPrice: '', gender: 'Any', date: '', sort: 'Recommended', location: ''
  });

  useEffect(() => {
    dispatch(fetchActivities(getToken));
  }, [dispatch, getToken]);

  const handleMouseMove = (e, cardId) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
    setHoveredCard(cardId);
  };

  // Derived filtered & sorted activities
  const filteredActivities = (activities || [])
    .filter(act => {
      const isJoined = act.participants?.some(p => (typeof p === 'string' ? p : p._id) === currentUser?._id);
      if (isJoined) return false;
      const isCreatedBy = (act.createdBy?._id || act.createdBy) === currentUser?._id;
      if (isCreatedBy) return false;
      const matchesSearch = act.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (act.location?.address || "").toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filters.location) {
        const actLocation = (act.location?.address || "").toLowerCase();
        const filterLocation = filters.location.toLowerCase();
        if (!actLocation.includes(filterLocation)) {
          const city = filterLocation.split(',')[0].trim();
          if (city && !actLocation.includes(city)) return false;
        }
      }
      if (filters.category !== 'All' && act.category !== filters.category) return false;
      const price = Number(act.price || 0);
      if (filters.minPrice !== '' && price < Number(filters.minPrice)) return false;
      if (filters.maxPrice !== '' && price > Number(filters.maxPrice)) return false;
      if (filters.gender !== 'Any' && act.gender !== 'Any' && act.gender !== filters.gender) return false;
      if (filters.date) {
        const actDate = new Date(act.date).toDateString();
        const filterDate = new Date(filters.date).toDateString();
        if (actDate !== filterDate) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case 'Price: Low to High': return (a.price || 0) - (b.price || 0);
        case 'Price: High to Low': return (b.price || 0) - (a.price || 0);
        case 'Nearest First': return new Date(a.date) - new Date(b.date);
        default: return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
      }
    });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 text-slate-900 relative overflow-hidden">
      {/* Global Styles */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #fef3c7 0%, #ffffff 25%, #fef9c3 50%, #ffffff 75%, #fef3c7 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        resultCount={filteredActivities.length}
        onReset={() => setFilters({category: 'All', minPrice: '', maxPrice: '', gender: 'Any', date: '', sort: 'Recommended', location: ''})}
      />

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 pb-16 pt-12 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[2.5rem] shadow-2xl shadow-orange-500/20 mb-8"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] bg-amber-300/30 rounded-full blur-3xl"
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
            <Zap className="w-4 h-4 text-amber-100" />
            <span>Happening Now</span>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 bg-green-400 rounded-full" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm"
          >
            Discover Activities <span className="shimmer-text">Near You</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-amber-50 max-w-2xl mx-auto text-lg leading-relaxed mb-8 font-medium"
          >
            Join vibrant communities, explore hidden gems, and make new friends with curated local experiences.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="max-w-3xl mx-auto bg-white rounded-2xl p-2 shadow-xl shadow-orange-900/10 flex flex-col md:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search adventures, workshops, or places..."
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
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" /> Filter
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-20">
        {/* Results Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-between mb-8 px-2"
        >
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Top Picks For You</h2>
            <p className="text-slate-500 text-sm">Showing {filteredActivities.length} results</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600 hidden sm:block">Sort by:</span>
            <select
              value={filters.sort}
              onChange={(e) => setFilters(prev => ({...prev, sort: e.target.value}))}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5"
            >
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Nearest First</option>
            </select>
          </div>
        </motion.div>

        {/* Loading / Empty / Grid */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 min-h-[400px]"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <Loader2 className="w-10 h-10 text-orange-500 mb-4" />
            </motion.div>
            <p className="text-slate-500 font-medium">Finding adventures nearby...</p>
          </motion.div>
        ) : filteredActivities.length === 0 ? (
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
              <Search className="w-8 h-8 text-slate-300" />
            </motion.div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No activities found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {setSearchQuery(''); setFilters({category: 'All', minPrice: '', maxPrice: '', gender: 'Any', date: '', sort: 'Recommended', location: ''})}}
              className="mt-6 text-orange-600 font-medium hover:underline"
            >
              Clear All Filters
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredActivities.map((activity) => {
              const participantsCount = activity.participants ? activity.participants.length : 0;
              const status = getActivityStatus(participantsCount, activity.maxCapacity);
              const activityDate = activity.date ? new Date(activity.date) : new Date();
              const startTime = activity.startTime ? new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD";
              const isHovered = hoveredCard === activity._id;

              return (
                <motion.div
                  key={activity._id}
                  variants={cardVariants}
                  onMouseMove={(e) => handleMouseMove(e, activity._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative bg-gradient-to-br from-white via-orange-50/40 to-amber-50/50 rounded-3xl overflow-hidden border border-orange-100 shadow-xl shadow-orange-100/30 hover:border-orange-200 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-200/30"
                >
                  {/* Hover Glow Effect */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 transition-opacity duration-300 rounded-3xl z-0 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(251, 146, 60, 0.15) 0%, transparent 50%)`,
                      }}
                    />
                  )}

                  {/* Image Section */}
                  <div className="h-64 relative overflow-hidden">
                    <ImageSlider photos={activity.photos} />
                    <div className="absolute top-4 left-4 z-10">
                      <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="px-3 py-1 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1"
                      >
                        {activity.category === 'Adventure' && <Zap className="w-3 h-3 text-orange-500" />}
                        {activity.category}
                      </motion.span>
                    </div>
                    <div className="absolute top-4 right-4 z-10">
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <div className="absolute bottom-4 left-4 z-10">
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${status.color}`}
                      >
                        {status.text}
                      </motion.span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                        {activity.title}
                      </h3>
                      <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-700">4.8</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                      <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <AddressDisplay location={activity.location} />
                    </div>

                    {/* Meta Info Grid */}
                    <div className="flex flex-wrap gap-y-3 gap-x-4 text-xs font-medium text-slate-600 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {activityDate.getDate()} {activity.endDate ? (
                            <>
                              - {new Date(activity.endDate).getDate()} {new Date(activity.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              <span className="ml-1 text-indigo-600">
                                ({Math.ceil((new Date(activity.endDate) - activityDate) / (1000 * 60 * 60 * 24)) + 1} days)
                              </span>
                            </>
                          ) : (
                            activityDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                          )}
                        </span>
                      </div>
                      <div className="w-px h-4 bg-slate-200" />
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{startTime}</span>
                      </div>
                      <div className="w-px h-4 bg-slate-200" />
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{participantsCount}/{activity.maxCapacity}</span>
                      </div>
                      {activity.gender && activity.gender !== "Any" && (
                        <div className="w-full pt-2 mt-2 border-t border-slate-200 flex items-center gap-1.5 text-rose-500">
                          <Users className="w-3.5 h-3.5" />
                          <span>{activity.gender} Limited</span>
                        </div>
                      )}
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase">Price per person</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-slate-900">₹{activity.price}</span>
                          {activity.price === 0 && <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full">FREE</span>}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-200 flex items-center gap-2 ${
                          status.type === 'full'
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700'
                        }`}
                        disabled={status.type === 'full'}
                        onClick={() => navigate(`/activity/${activity._id}`)}
                      >
                        {status.type === 'full' ? 'Sold Out' : <>Join <ChevronRight className="w-4 h-4" /></>}
                      </motion.button>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}