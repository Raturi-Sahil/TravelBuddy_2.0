import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

import {
  Loader2, MapPin, Users, Calendar, Search, Star, Clock, Zap,
  Filter, Play, ChevronLeft, ChevronRight, DollarSign, Globe, Heart, X
} from "lucide-react";
import { fetchActivities } from "../../redux/slices/ActivitySlice";
import { Autocomplete } from "@react-google-maps/api";
import { useGoogleMaps } from "../../context/GoogleMapsContext";
import ReverseGeocode from "../../helpers/reverseGeoCode";

// Component to fetch and display address from coordinates
const AddressDisplay = ({ location }) => {
  const [address, setAddress] = useState("Loading location...");

  useEffect(() => {
    // If address string is already available, use it
    if (location?.address) {
      setAddress(location.address);
      return;
    }

    // Otherwise use coordinates to fetch address
    const fetchAddress = async () => {
      if (location?.coordinates && location.coordinates.length === 2) {
        // coordinates are [lng, lat]
        const lng = location.coordinates[0];
        const lat = location.coordinates[1];
        try {
          const result = await ReverseGeocode({ lat, lng });
          setAddress(result);
        } catch (error) {
          setAddress("Location text unavailable");
        }
      } else {
        setAddress("Location unspecified");
      }
    };

    fetchAddress();
  }, [location]);

  return <span className="truncate">{address}</span>;
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
  // Ensure photos is an array and filter out empty strings
  const validPhotos = Array.isArray(photos) ? photos.filter(p => p) : [];

  if (!validPhotos.length) return <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400"><MapPin /></div>;

  return (
    <div className="relative h-full w-full group">
      <img src={validPhotos[idx]} alt="Activity" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

      {validPhotos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((p) => p > 0 ? p - 1 : validPhotos.length - 1)}}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 text-slate-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((p) => (p + 1) % validPhotos.length)}}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 text-slate-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {validPhotos.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-3' : 'bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const FilterModal = ({ isOpen, onClose, filters, setFilters, resultCount, onReset }) => {
  const { isLoaded } = useGoogleMaps();
  const autocompleteRef = React.useRef(null);

  const onAutocompleteLoad = (autocomplete) => { autocompleteRef.current = autocomplete; };
  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place) {
        const address = place.formatted_address || place.name;
        setFilters(prev => ({ ...prev, location: address }));
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

        <div className={`relative w-full max-w-md bg-white h-full shadow-2xl transition-transform duration-300 transform flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <h2 className="text-xl font-bold text-slate-900">Filters</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">

                {/* Location Search (Google Maps) */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Location</h3>
                    {isLoaded ? (
                         <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                             <div className="relative">
                                 <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                 <input
                                     type="text"
                                     placeholder="Search city, area..."
                                     className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-slate-700 font-medium"
                                     value={filters.location}
                                     onChange={(e) => setFilters(prev => ({...prev, location: e.target.value}))}
                                 />
                             </div>
                         </Autocomplete>
                    ) : (
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-sm">
                            Loading Map Search...
                        </div>
                    )}
                </div>

                <div className="h-px bg-slate-100"></div>

                {/* Category Section */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Category</h3>
                    <div className="flex flex-wrap gap-2">
                        {['All', 'Adventure', 'Culture', 'Food', 'Sports', 'Art', 'Music', 'Tech'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilters(prev => ({...prev, category: cat}))}
                                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                                    filters.category === cat
                                    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                {/* Price Range */}
                <div>
                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Price Range</h3>
                     <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input
                                type="number"
                                placeholder="Min"
                                value={filters.minPrice}
                                onChange={(e) => setFilters(prev => ({...prev, minPrice: e.target.value}))}
                                className="w-full pl-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium"
                            />
                        </div>
                        <span className="text-slate-400 font-medium">to</span>
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters(prev => ({...prev, maxPrice: e.target.value}))}
                                className="w-full pl-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium"
                            />
                        </div>
                     </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                {/* Gender */}
                <div>
                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Gender Preference</h3>
                     <div className="grid grid-cols-3 gap-3">
                         {['Any', 'Male', 'Female'].map(g => (
                             <button
                                key={g}
                                onClick={() => setFilters(prev => ({...prev, gender: g}))}
                                className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                                    filters.gender === g
                                    ? 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-500'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                             >
                                 {g}
                             </button>
                         ))}
                     </div>
                </div>

                <div className="h-px bg-slate-100"></div>

                {/* Date */}
                <div>
                     <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Date</h3>
                     <input
                        type="date"
                        value={filters.date}
                        onChange={(e) => setFilters(prev => ({...prev, date: e.target.value}))}
                        className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-slate-700 font-medium"
                     />
                </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-slate-100 bg-slate-50">
                <div className="flex gap-4">
                    <button
                        onClick={onReset}
                        className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Reset
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all hover:-translate-y-0.5"
                    >
                        Show {resultCount} Results
                    </button>
                </div>
            </div>

        </div>
    </div>
  );
};

export default function ActivityNearMe() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { activities, isLoading, error } = useSelector((state) => state.activity);
  const { profile: currentUser } = useSelector((state) => state.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: 'All',
    minPrice: '',
    maxPrice: '',
    gender: 'Any',
    date: '',
    sort: 'Recommended',
    location: ''
  });

  useEffect(() => {
    dispatch(fetchActivities(getToken));
  }, [dispatch, getToken]);

  // Derived filtered & sorted activities
  const filteredActivities = (activities || [])
    .filter(act => {
      // Exclude joined activities
      const isJoined = act.participants?.some(p =>
        (typeof p === 'string' ? p : p._id) === currentUser?._id
      );
      if (isJoined) return false;

      // Exclude activities created by the current user (optional, but good practice for "Nearby" usually)
      const isCreatedBy = (act.createdBy?._id || act.createdBy) === currentUser?._id;
      if (isCreatedBy) return false;

      // Search Query
      const matchesSearch =
        act.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (act.location?.address || "").toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Location Filter (from Google Maps Autocomplete)
      if (filters.location) {
          const actLocation = (act.location?.address || "").toLowerCase();
          const filterLocation = filters.location.toLowerCase();

          if (!actLocation.includes(filterLocation)) {
             const city = filterLocation.split(',')[0].trim();
             if (city && !actLocation.includes(city)) return false;
          }
      }

      // Category filter
      if (filters.category !== 'All' && act.category !== filters.category) return false;

      // Price Filter
      const price = Number(act.price || 0);
      if (filters.minPrice !== '' && price < Number(filters.minPrice)) return false;
      if (filters.maxPrice !== '' && price > Number(filters.maxPrice)) return false;

      // Gender Filter
      if (filters.gender !== 'Any' && act.gender !== 'Any' && act.gender !== filters.gender) return false;

      // Date Filter
      if (filters.date) {
        const actDate = new Date(act.date).toDateString();
        const filterDate = new Date(filters.date).toDateString();
        if (actDate !== filterDate) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case 'Price: Low to High':
          return (a.price || 0) - (b.price || 0);
        case 'Price: High to Low':
            return (b.price || 0) - (a.price || 0);
        case 'Nearest First':
           return new Date(a.date) - new Date(b.date);
        default: // Recommended (Newest/Featured)
          return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
      }
    });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 ">
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
      <div className="relative bg-gradient-to-br from-amber-400 to-orange-600 pb-16 pt-12 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-[2.5rem] shadow-2xl shadow-orange-500/20 mb-8">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
             <div className="absolute top-0 right-[-10%] w-[50%] h-[150%] bg-white/10 rounded-full blur-3xl transform rotate-12"></div>
             <div className="absolute bottom-0 left-[-10%] w-[40%] h-[120%] bg-amber-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center z-10 mt-16">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium mb-6 animate-fade-in-up">
              <Zap className="w-4 h-4 text-amber-100" /> <span>Happening Now</span>
           </div>

           <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
             Discover Activities <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-white">Near You</span>
           </h1>

           <p className="text-amber-50 max-w-2xl mx-auto text-lg leading-relaxed mb-8 font-medium">
             Join vibrant communities, explore hidden gems, and make new friends with curated local experiences.
           </p>

           {/* Search Bar - Floating */}
           <div className="max-w-3xl mx-auto bg-white rounded-2xl p-2 shadow-xl shadow-orange-900/5 flex flex-col md:flex-row gap-2">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search adventures, workshops, or places..."
                    className="w-full bg-transparent border-none rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <div className="h-0.5 w-full md:w-0.5 md:h-12 bg-slate-100"></div>
               <button
                onClick={() => setIsFilterOpen(true)}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
               >
                  <Filter className="w-4 h-4" /> Filter
               </button>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-20">

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8 px-2">
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
        </div>

        {/* Loading / Empty / Grid */}
        {isLoading ? (
           <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
             <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
             <p className="text-slate-500 font-medium">Finding adventures nearby...</p>
           </div>
        ) : filteredActivities.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No activities found</h3>
              <p className="text-slate-500">Try adjusting your filters or search query</p>
              <button
                onClick={() => {setSearchQuery(''); setFilters({category: 'All', minPrice: '', maxPrice: '', gender: 'Any', date: '', sort: 'Recommended'})}}
                className="mt-6 text-orange-600 font-medium hover:underline"
              >
                  Clear All Filters
              </button>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities.map((activity, index) => {
              const participantsCount = activity.participants ? activity.participants.length : 0;
              const status = getActivityStatus(participantsCount, activity.maxCapacity);
              const activityDate = activity.date ? new Date(activity.date) : new Date();
              const startTime = activity.startTime ? new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD";

              return (
                <div
                  key={activity._id}
                  className="group bg-gradient-to-br from-gray-50 to-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-300/40 hover:border-orange-200 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-400/20 hover:-translate-y-1"
                >
                  {/* Image Section */}
                  <div className="h-64 relative overflow-hidden">
                    <ImageSlider photos={activity.photos} />

                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4">
                       <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1">
                          {activity.category === 'Adventure' && <Zap className="w-3 h-3 text-orange-500" />}
                          {activity.category}
                       </span>
                    </div>

                    <div className="absolute top-4 right-4 flex gap-2">
                       <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-colors">
                           <Heart className="w-4 h-4" />
                       </button>
                    </div>

                    <div className="absolute bottom-4 left-4 flex gap-2">
                       <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${status.color}`}>
                          {status.text}
                       </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
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
                       <div className="w-px h-4 bg-slate-200"></div>
                       <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{startTime}</span>
                       </div>
                       <div className="w-px h-4 bg-slate-200"></div>
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

                       <button
                         className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-200 active:scale-95 flex items-center gap-2 ${
                            status.type === 'full'
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700'
                         }`}
                         disabled={status.type === 'full'}
                         onClick={() => navigate(`/activity/${activity._id}`)}
                       >
                         {status.type === 'full' ? 'Sold Out' : <>Join <ChevronRight className="w-4 h-4" /></>}
                       </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}