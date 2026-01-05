import { useAuth } from '@clerk/clerk-react';
import { Autocomplete } from '@react-google-maps/api';
import {
  Award,
  BadgeCheck,
  Calendar,
  ChevronDown,
  Clock,
  Compass,
  Filter,
  Globe,
  Heart,
  MapPin,
  Navigation,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { GUIDE_SPECIALTIES } from '../../data/enums';
import { fetchGuides, fetchNearbyGuides } from '../../redux/slices/guideSlice';

const BrowseGuides = () => {
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const { guides, pagination, guidesLoading, error } = useSelector((state) => state.guide);

  const [filters, setFilters] = useState({
    city: '',
    specialty: '',
    minRating: '',
    sortBy: 'rating',
    radius: '15',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [hoveredGuide, setHoveredGuide] = useState(null);
  const autocompleteRef = useRef(null);

  const loadGuides = (customFilters = filters, location = selectedLocation) => {
    if (location) {
      const radiusInMeters = (parseInt(customFilters.radius) || 15) * 1000;
      dispatch(fetchNearbyGuides({
        getToken,
        lat: location.lat,
        lng: location.lng,
        radius: radiusInMeters,
        filters: customFilters,
      }));
    } else {
      dispatch(fetchGuides({ getToken, filters: customFilters }));
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      loadGuides(filters, selectedLocation);
    } else {
      dispatch(fetchGuides({ getToken, filters }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, getToken]);

  const onAutocompleteLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = async () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      let locationName = place.formatted_address || place.name || 'Selected Location';
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`
        );
        const data = await response.json();
        if (data?.display_name) {
          locationName = data.display_name;
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
      }

      const location = { lat, lng, name: locationName };
      setSelectedLocation(location);
      setSearchCity(locationName);
      loadGuides(filters, location);
    }
  };

  const clearLocation = () => {
    setSelectedLocation(null);
    setSearchCity('');
    loadGuides(filters, null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedLocation) return;
    const newFilters = { ...filters, city: searchCity };
    setFilters(newFilters);
    loadGuides(newFilters, null);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    loadGuides(filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      city: '',
      specialty: '',
      minRating: '',
      sortBy: 'rating',
      radius: '15',
    };
    setFilters(clearedFilters);
    setSearchCity('');
    setSelectedLocation(null);
    loadGuides(clearedFilters, null);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
      />
    ));
  };

  // Stats data
  const stats = [
    { icon: Users, value: '500+', label: 'Verified Guides', color: 'from-blue-500 to-cyan-500' },
    { icon: Star, value: '4.8', label: 'Average Rating', color: 'from-amber-500 to-orange-500' },
    { icon: Globe, value: '50+', label: 'Cities Covered', color: 'from-emerald-500 to-teal-500' },
    { icon: Heart, value: '10K+', label: 'Happy Travelers', color: 'from-pink-500 to-rose-500' },
  ];

  // Featured specialties with icons
  const featuredSpecialties = [
    { name: 'Adventure Tours', icon: Compass },
    { name: 'Cultural Tours', icon: Globe },
    { name: 'Food Tours', icon: Sparkles },
    { name: 'Photography', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      {/* Hero Section */}
      <div className="relative pt-20 pb-12 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-orange-200/40 to-amber-200/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Content */}
          <div className="text-center mb-10 mt-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full mb-6 border border-orange-200/50 shadow-sm">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-700">Discover Local Experts</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Find Your Perfect
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                Local Guide
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Connect with verified local experts for authentic, personalized travel experiences that create lasting memories
            </p>
          </div>

          {/* Premium Search Box */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/50 p-2">
                <div className="flex flex-col md:flex-row gap-2">
                  {/* Location Input */}
                  <div className="flex-1 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-focus-within:scale-110 transition-transform">
                        <Navigation size={18} className="text-white" />
                      </div>
                    </div>
                    <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                      <input
                        type="text"
                        placeholder="Where do you want to explore?"
                        value={searchCity}
                        onChange={(e) => {
                          setSearchCity(e.target.value);
                          if (!e.target.value) setSelectedLocation(null);
                        }}
                        className="w-full pl-16 pr-12 py-4 bg-gray-50/50 border border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-lg"
                      />
                    </Autocomplete>
                    {selectedLocation && (
                      <button
                        type="button"
                        onClick={clearLocation}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center justify-center gap-2 px-5 py-4 rounded-xl font-semibold transition-all ${
                        showFilters
                          ? 'bg-gray-900 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Filter size={20} />
                      <span className="hidden sm:inline">Filters</span>
                      <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Search size={20} />
                      <span>Search</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Specialty Tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <span className="text-sm text-gray-500">Popular:</span>
                {featuredSpecialties.map((specialty) => (
                  <button
                    key={specialty.name}
                    type="button"
                    onClick={() => {
                      handleFilterChange('specialty', specialty.name);
                      applyFilters();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 hover:bg-white border border-gray-200/50 hover:border-orange-300 rounded-full text-sm font-medium text-gray-600 hover:text-orange-600 shadow-sm hover:shadow transition-all"
                  >
                    <specialty.icon size={14} />
                    {specialty.name}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Location Badge */}
          {selectedLocation && (
            <div className="max-w-4xl mx-auto mt-4">
              <div className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <Navigation size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-emerald-600 font-medium">Searching within</p>
                  <p className="text-sm text-gray-700 font-semibold truncate max-w-md">
                    {filters.radius}km of {selectedLocation.name}
                  </p>
                </div>
                <button
                  onClick={clearLocation}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                  <Filter size={20} className="text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Refine Your Search</h3>
                  <p className="text-sm text-gray-500">Find the perfect guide for your journey</p>
                </div>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Specialty Filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Compass size={16} className="text-orange-500" />
                  Specialty
                </label>
                <select
                  value={filters.specialty}
                  onChange={(e) => handleFilterChange('specialty', e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none transition-all cursor-pointer"
                >
                  <option value="">All Specialties</option>
                  {GUIDE_SPECIALTIES.map((specialty) => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>

              {/* Radius Filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <MapPin size={16} className="text-blue-500" />
                  Search Radius
                </label>
                <select
                  value={filters.radius}
                  onChange={(e) => handleFilterChange('radius', e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none transition-all cursor-pointer"
                >
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="15">15 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                  <option value="100">100 km</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Star size={16} className="text-amber-500" />
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none transition-all cursor-pointer"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars ⭐</option>
                  <option value="4.5">4.5+ Stars ⭐⭐</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <TrendingUp size={16} className="text-emerald-500" />
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 outline-none transition-all cursor-pointer"
                >
                  <option value="rating">Top Rated</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="experience">Most Experienced</option>
                  <option value="reviews">Most Reviewed</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={clearFilters}
                className="flex-1 sm:flex-none px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold hover:bg-gray-100 rounded-xl transition-all"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {(filters.city || filters.specialty || filters.minRating) && (
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Active filters:</span>
            {filters.city && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200/50">
                <MapPin size={14} />
                {filters.city}
                <button onClick={() => handleFilterChange('city', '')} className="ml-1 hover:text-blue-900">
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.specialty && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200/50">
                <Compass size={14} />
                {filters.specialty}
                <button onClick={() => handleFilterChange('specialty', '')} className="ml-1 hover:text-purple-900">
                  <X size={14} />
                </button>
              </span>
            )}
            {filters.minRating && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-200/50">
                <Star size={14} />
                {filters.minRating}+ Stars
                <button onClick={() => handleFilterChange('minRating', '')} className="ml-1 hover:text-amber-900">
                  <X size={14} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {guidesLoading ? 'Finding Guides...' : `${pagination?.totalCount || guides.length} Guides Available`}
            </h2>
            <p className="text-gray-500">Verified experts ready to show you around</p>
          </div>
          {!guidesLoading && guides.length > 0 && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200/50">
              <Shield size={18} className="text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">All guides are verified</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {guidesLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-orange-200 rounded-full" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="mt-6 text-lg text-gray-600 font-medium">Finding perfect guides for you...</p>
            <p className="text-sm text-gray-400">This won't take long</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
              <X size={40} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => loadGuides()}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Try Again
            </button>
          </div>
        ) : guides.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mb-6">
              <Compass size={48} className="text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Guides Found</h3>
            <p className="text-gray-500 mb-2 text-center max-w-md">
              We couldn't find any guides matching your criteria. Try adjusting your filters or searching in a different location.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Guides Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide) => (
                <Link
                  to={`/guide/${guide._id}`}
                  key={guide._id}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                  onMouseEnter={() => setHoveredGuide(guide._id)}
                  onMouseLeave={() => setHoveredGuide(null)}
                >
                  {/* Cover Image */}
                  <div className="relative h-52 bg-gradient-to-br from-orange-100 to-amber-50 overflow-hidden">
                    {guide.coverImages?.[0] ? (
                      <img
                        src={guide.coverImages[0]}
                        alt={guide.user?.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-white/50 flex items-center justify-center">
                          <Users size={40} className="text-orange-300" />
                        </div>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                      {guide.isVerified && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                          <BadgeCheck size={14} />
                          Verified
                        </span>
                      )}
                      {guide.averageRating >= 4.5 && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg ml-auto">
                          <Zap size={14} />
                          Top Rated
                        </span>
                      )}
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-4 right-4">
                      <div className="px-4 py-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
                        <span className="text-xs text-gray-500 block">From</span>
                        <span className="text-xl font-bold text-gray-900">₹{guide.pricePerDay}</span>
                        <span className="text-xs text-gray-500">/day</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Profile Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <img
                          src={guide.user?.profileImage || '/default-avatar.png'}
                          alt={guide.user?.name}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-lg ring-2 ring-orange-100"
                        />
                        {hoveredGuide === guide._id && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                          {guide.user?.name}
                        </h3>
                        <p className="flex items-center gap-1.5 text-sm text-gray-500">
                          <MapPin size={14} className="text-orange-500" />
                          <span className="truncate">{guide.city}</span>
                        </p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                      <div className="flex">{renderStars(guide.averageRating)}</div>
                      <span className="text-sm font-semibold text-gray-700">
                        {guide.averageRating?.toFixed(1) || 'New'}
                      </span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{guide.totalReviews} reviews</span>
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {guide.specialties?.slice(0, 3).map((specialty) => (
                        <span
                          key={specialty}
                          className="px-3 py-1 bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-700 text-xs font-medium rounded-lg transition-colors"
                        >
                          {specialty}
                        </span>
                      ))}
                      {guide.specialties?.length > 3 && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-lg">
                          +{guide.specialties.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Clock size={14} className="text-blue-500" />
                          <span>{guide.experience} yrs exp</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Globe size={14} className="text-emerald-500" />
                          <span>{guide.languages?.length || 0} langs</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-orange-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                        View Profile
                        <ChevronDown size={16} className="-rotate-90" />
                      </div>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-orange-500/0 group-hover:ring-orange-500/30 transition-all duration-500 pointer-events-none" />
                </Link>
              ))}
            </div>

            {/* Load More */}
            {pagination?.hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => loadGuides({ ...filters, page: (pagination.page || 1) + 1 })}
                  className="group inline-flex items-center gap-3 px-10 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:border-orange-400 hover:text-orange-600 hover:shadow-xl hover:shadow-orange-500/10 transition-all"
                >
                  <span>Load More Guides</span>
                  <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                    <ChevronDown size={18} />
                  </div>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom CTA Section */}
      {!guidesLoading && guides.length > 0 && (
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full mb-6">
              <Award className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-semibold text-orange-400">Become a Guide</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Share Your Local Knowledge
            </h2>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Join our community of verified guides and help travelers discover the authentic side of your city while earning money doing what you love.
            </p>
            <Link
              to="/guide-setup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:scale-105 transition-all"
            >
              <Sparkles size={20} />
              Become a Guide Today
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseGuides;
