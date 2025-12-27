import { useAuth } from '@clerk/clerk-react';
import {
  Calendar,
  DollarSign,
  Filter,
  Globe,
  MapPin,
  Search,
  Star,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { GUIDE_SPECIALTIES } from '../../data/enums';
import { fetchGuides } from '../../redux/slices/guideSlice';

const BrowseGuides = () => {
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const { guides, pagination, guidesLoading, error } = useSelector((state) => state.guide);

  const [filters, setFilters] = useState({
    city: '',
    specialty: '',
    minRating: '',
    sortBy: 'rating',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchCity, setSearchCity] = useState('');

  const loadGuides = (customFilters = filters) => {
    dispatch(fetchGuides({ getToken, filters: customFilters }));
  };

  useEffect(() => {
    dispatch(fetchGuides({ getToken, filters }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, getToken]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newFilters = { ...filters, city: searchCity };
    setFilters(newFilters);
    loadGuides(newFilters);
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
    };
    setFilters(clearedFilters);
    setSearchCity('');
    loadGuides(clearedFilters);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Find Local Guides
          </h1>
          <p className="text-gray-600">
            Connect with verified local experts for authentic experiences
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto mb-6">
          <div className="flex-1 relative">
            <MapPin size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by city..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all"
          >
            <Search size={20} />
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
          >
            <Filter size={20} />
            Filters
          </button>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <div className="max-w-3xl mx-auto mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filter Guides</h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <select
                  value={filters.specialty}
                  onChange={(e) => handleFilterChange('specialty', e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="">All Specialties</option>
                  {GUIDE_SPECIALTIES.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="rating">Top Rated</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="experience">Most Experienced</option>
                  <option value="reviews">Most Reviewed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(filters.city || filters.specialty || filters.minRating) && (
          <div className="flex flex-wrap gap-2 max-w-3xl mx-auto mb-6">
            {filters.city && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm">
                <MapPin size={14} />
                {filters.city}
                <X size={14} className="cursor-pointer hover:text-orange-900" onClick={() => handleFilterChange('city', '')} />
              </span>
            )}
            {filters.specialty && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm">
                {filters.specialty}
                <X size={14} className="cursor-pointer hover:text-purple-900" onClick={() => handleFilterChange('specialty', '')} />
              </span>
            )}
            {filters.minRating && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                <Star size={14} />
                {filters.minRating}+
                <X size={14} className="cursor-pointer hover:text-yellow-900" onClick={() => handleFilterChange('minRating', '')} />
              </span>
            )}
          </div>
        )}

        {/* Guides Grid */}
        <div className="mt-8">
          {guidesLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Finding guides...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => loadGuides()}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : guides.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Users size={48} className="mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Guides Found</h3>
              <p>Try adjusting your filters or search in a different city</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-500">
                {pagination?.totalCount || guides.length} guides found
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((guide) => (
                  <Link
                    to={`/guide/${guide._id}`}
                    key={guide._id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Cover Image */}
                    <div className="relative h-48 bg-gradient-to-br from-orange-100 to-amber-50">
                      {guide.coverImages?.[0] ? (
                        <img src={guide.coverImages[0]} alt={guide.user?.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users size={40} className="text-orange-300" />
                        </div>
                      )}
                      {guide.isVerified && (
                        <span className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Profile Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={guide.user?.profileImage || '/default-avatar.png'}
                          alt={guide.user?.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {guide.user?.name}
                          </h3>
                          <p className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin size={14} />
                            {guide.city}
                          </p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">{renderStars(guide.averageRating)}</div>
                        <span className="text-sm text-gray-600">
                          {guide.averageRating?.toFixed(1) || 'New'} ({guide.totalReviews} reviews)
                        </span>
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {guide.specialties?.slice(0, 3).map((specialty) => (
                          <span key={specialty} className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">
                            {specialty}
                          </span>
                        ))}
                        {guide.specialties?.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            +{guide.specialties.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Languages */}
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                        <Globe size={14} />
                        {guide.languages?.slice(0, 2).map((lang) => lang.name).join(', ')}
                        {guide.languages?.length > 2 && ` +${guide.languages.length - 2}`}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar size={14} />
                          {guide.experience} years
                        </div>
                        <div className="flex items-center gap-1 text-lg font-bold text-orange-600">
                          <DollarSign size={16} />
                          ₹{guide.pricePerDay}/day
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination?.hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => loadGuides({ ...filters, page: (pagination.page || 1) + 1 })}
                    className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:shadow-md transition-all"
                  >
                    Load More Guides
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseGuides;
