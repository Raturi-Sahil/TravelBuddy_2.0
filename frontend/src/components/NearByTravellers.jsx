import { useAuth } from '@clerk/clerk-react';
import { Circle,GoogleMap, Marker } from '@react-google-maps/api';
import {
  AlertCircle,
  ChevronRight,
  Filter,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Radio,
  Search,
  Sliders,
  Users,
  X} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGoogleMaps } from '../context/GoogleMapsContext';
import { createAuthenticatedApi, userService } from '../redux/services/api';

// MOCK DATA
const MOCK_TRAVELERS = [
  {
    _id: '1',
    fullName: 'Aarav Sharma',
    profilePicture: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150',
    currentLocation: { lat: 20.61, lng: 78.98 },
    distanceKm: 2.5,
    interests: ['Photography', 'Hiking']
  },
  {
    _id: '2',
    fullName: 'Priya Patel',
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    currentLocation: { lat: 20.58, lng: 78.95 },
    distanceKm: 3.8,
    interests: ['Food', 'Culture']
  },
  {
    _id: '3',
    fullName: 'Rohan Gupta',
    profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    currentLocation: { lat: 20.60, lng: 78.99 },
    distanceKm: 4.2,
    interests: ['Tech', 'Music']
  },
  {
    _id: '4',
    fullName: 'Sneha Singh',
    profilePicture: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=150',
    currentLocation: { lat: 20.62, lng: 78.94 },
    distanceKm: 5.1,
    interests: ['Travel', 'Art']
  },
  {
    _id: '5',
    fullName: 'Vikram Malhotra',
    profilePicture: 'https://images.unsplash.com/photo-1590086782957-93c06ef21604?auto=format&fit=crop&q=80&w=150',
    currentLocation: { lat: 20.57, lng: 78.93 },
    distanceKm: 6.5,
    interests: ['Sports', 'Movies']
  }
];

const containerStyle = {
  width: '100%',
  height: '100%'
};

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_RADIUS_KM = 20;
const MIN_RADIUS_KM = 5;
const MAX_RADIUS_KM = 100;

// Light map styles (optional, default Google Maps style is usually good for light theme)
const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
};


function AllTravelersOnMap() {
  const { isLoaded } = useGoogleMaps();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTraveler, setSelectedTraveler] = useState(null);
  const [showList, setShowList] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyTravelers, setNearbyTravelers] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingTravelers, setLoadingTravelers] = useState(false);
  const [error, setError] = useState('');
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [globalSearch, setGlobalSearch] = useState(false); // When true, search by name only (no radius limit)
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0, hasMore: false });

  const radiusMeters = radiusKm * 1000;

  const fetchNearbyTravelers = useCallback(async ({ lat, lng, radius, search = '', page = 1 } = {}) => {
    setLoadingTravelers(true);
    setError('');

    try {
      const authApi = createAuthenticatedApi(getToken);
      const response = await userService.getNearbyTravelers(authApi, { lat, lng, radius, search, page, limit: 50 });
      
      if (response.success && response.data) {
        const { users, pagination: paginationData } = response.data;
        
        // Transform API data to match expected format
        const travelers = users.map(user => ({
          _id: user._id,
          fullName: user.fullName || 'Anonymous',
          profilePicture: user.profilePicture || '',
          currentLocation: user.currentLocation?.coordinates 
            ? { lat: user.currentLocation.coordinates[1], lng: user.currentLocation.coordinates[0] }
            : null,
          distanceKm: user.distanceKm ?? null,
          interests: user.interests || [],
          isOnline: user.isOnline,
          nationality: user.nationality,
          travelStyle: user.travelStyle,
          bio: user.bio,
          gender: user.gender,
        }));
        
        setNearbyTravelers(travelers);
        setPagination(paginationData);
        setCurrentPage(paginationData.page);
      } else {
        setNearbyTravelers([]);
        setPagination({ page: 1, totalPages: 1, totalCount: 0, hasMore: false });
      }
    } catch (err) {
      console.error('Error fetching nearby travelers:', err);
      setError('Failed to fetch nearby travelers. Please try again.');
      setNearbyTravelers([]);
    } finally {
      setLoadingTravelers(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser.');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(coords);
        setLoadingLocation(false);
        fetchNearbyTravelers({ lat: coords.lat, lng: coords.lng, radius: radiusMeters });
      },
      () => {
         // Fallback for demo purposes if location is denied
        console.warn("Location denied, using default");
        const defaultCoords = DEFAULT_CENTER;
        setUserLocation(defaultCoords);
        setLoadingLocation(false);
        fetchNearbyTravelers({ lat: defaultCoords.lat, lng: defaultCoords.lng, radius: radiusMeters });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchNearbyTravelers]);

  const handleSearch = (page = 1) => {
    setCurrentPage(page);
    // If global search is enabled, search by name only (no location filter)
    if (globalSearch) {
      fetchNearbyTravelers({ search: searchQuery, page });
    } else {
      // Search with location filter
      fetchNearbyTravelers({ 
        lat: userLocation?.lat, 
        lng: userLocation?.lng, 
        radius: radiusMeters,
        search: searchQuery,
        page
      });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      handleSearch(newPage);
    }
  };

  const filteredTravelers = useMemo(() => {
    // Filtering is now done server-side, so just return all travelers
    return nearbyTravelers;
  }, [nearbyTravelers]);

  const handleRetry = () => {
    setLoadingLocation(true);
    setError('');
    setNearbyTravelers([]);

    // Simple retry logic
    if (userLocation) {
        fetchNearbyTravelers(userLocation.lat, userLocation.lng);
        setLoadingLocation(false);
    } else {
        // Re-trigger effect basically
         navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                setUserLocation(coords);
                setLoadingLocation(false);
                fetchNearbyTravelers(coords.lat, coords.lng);
            },
            () => {
                 const defaultCoords = DEFAULT_CENTER;
                 setUserLocation(defaultCoords);
                 setLoadingLocation(false);
                 fetchNearbyTravelers(defaultCoords.lat, defaultCoords.lng);
            }
         );
    }
  };

  const getUserMarkerIcon = () => {
    if (!window.google) return undefined;
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: '#3b82f6',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3
    };
  };

  if (!isLoaded || loadingLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-gray-100 text-center space-y-6 max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/10 blur-3xl rounded-full" />
            <Loader2 className="relative h-16 w-16 animate-spin text-orange-500 mx-auto" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">Preparing Your Map</p>
            <p className="text-gray-500">Fetching your location and nearby travelers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pt-28 pb-12">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-2xl" />
                <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-2xl shadow-lg shadow-orange-500/20">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Nearby Travelers
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                    <p className="text-sm font-medium text-gray-600">
                      {filteredTravelers.length} found
                    </p>
                  </div>
                  <span className="text-gray-300">•</span>
                  <p className="text-sm text-gray-500">Within {radiusKm} km radius</p>
                </div>
              </div>
            </div>
            
            {/* Mobile List Toggle */}
            <button
              onClick={() => setShowList(!showList)}
              className="sm:hidden bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 active:scale-95"
            >
              {showList ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
            </button>
          </div>

          {/* Search Bar with Global Toggle */}
          <div className="flex gap-3 mb-4">
            <div className="relative group flex-1">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-purple-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                <input
                  type="text"
                  placeholder={globalSearch ? "Search by name (worldwide)..." : "Search by name or interests..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md hover:border-orange-200"
                />
              </div>
            </div>
            
            {/* Global Search Toggle Button */}
            <button
              onClick={() => setGlobalSearch(!globalSearch)}
              title={globalSearch ? "Switch to nearby search" : "Switch to global search"}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap ${
                globalSearch 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm'
              }`}
            >
              {globalSearch ? (
                <>
                  <span className="text-lg">🌍</span>
                  <span className="hidden sm:inline">Global</span>
                </>
              ) : (
                <>
                  <LocateFixed className="h-4 w-4" />
                  <span className="hidden sm:inline">Nearby</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleSearch}
              disabled={loadingTravelers}
              className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loadingTravelers ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          {/* Radius Slider - Only show when NOT in global search mode */}
          {!globalSearch && (
            <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span>Radius:</span>
              </div>
              <input
                type="range"
                min={MIN_RADIUS_KM}
                max={MAX_RADIUS_KM}
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <span className="text-sm font-bold text-orange-600 min-w-[60px] text-right">{radiusKm} km</span>
            </div>
          )}
          
          {globalSearch && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm">
              <span className="text-lg">🌍</span>
              <span>Searching worldwide - no distance limit</span>
            </div>
          )}



          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-start space-x-3 text-sm bg-red-50 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800">Error</p>
                <p className="text-red-600 mt-0.5">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="text-red-700 font-semibold hover:text-red-800 hover:underline transition-colors whitespace-nowrap"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-250px)] gap-6 p-4 sm:p-6">
          {/* Enhanced Sidebar */}
          <div
            className={`${
              showList ? 'block' : 'hidden'
            } lg:block lg:w-96 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl overflow-hidden`}
          >
            <div className="bg-gradient-to-r from-orange-50 to-white border-b border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900 text-lg">Active Travelers</h2>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-semibold">
                    {filteredTravelers.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[400px] lg:max-h-[calc(100vh-320px)] p-4 space-y-3">
              {loadingTravelers && (
                <div className="flex flex-col items-center justify-center py-12 text-orange-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <p className="text-sm font-medium text-gray-500">Loading travelers...</p>
                </div>
              )}

              {!loadingTravelers && filteredTravelers.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-medium">No travelers found</p>
                  <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria</p>
                </div>
              )}

              {filteredTravelers.map((traveler) => (
                <div
                  key={traveler._id}
                  onClick={() => setSelectedTraveler(selectedTraveler?._id === traveler._id ? null : traveler)}
                  className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
                    selectedTraveler?._id === traveler._id
                      ? 'bg-orange-50 border-2 border-orange-500 shadow-md'
                      : 'bg-white hover:bg-gray-50 shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {selectedTraveler?._id === traveler._id && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full" />
                  )}

                  <div className="relative p-4">
                    <div className="flex items-center space-x-4">
                      {/* Profile Picture */}
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-white flex items-center justify-center text-xl font-bold text-orange-500 shadow-md ring-2 ring-white">
                          {traveler.profilePicture ? (
                            <img
                              src={traveler.profilePicture}
                              alt={traveler.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            traveler.fullName?.charAt(0)?.toUpperCase()
                          )}
                        </div>
                        {/* Online Status */}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm">
                          <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-75" />
                        </div>
                      </div>

                      {/* Traveler Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-base group-hover:text-orange-600 transition-colors">
                          {traveler.fullName}
                        </p>
                        <div className="flex items-center space-x-2 mt-1.5">
                          {traveler.distanceKm !== null ? (
                            <div className="flex items-center space-x-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                              <MapPin className="h-3.5 w-3.5 text-orange-500" />
                              <span className="font-medium">{traveler.distanceKm} km</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-sm text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                              <MapPin className="h-3.5 w-3.5 text-gray-400" />
                              <span className="font-medium">--</span>
                            </div>
                          )}
                          {traveler.interests && traveler.interests.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <div className="w-1 h-1 bg-gray-300 rounded-full" />
                              <span className="text-xs text-gray-500 truncate max-w-[100px]">
                                {traveler.interests[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expand/Collapse Icon */}
                      <ChevronRight className={`h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-all ${
                        selectedTraveler?._id === traveler._id ? 'rotate-90 text-orange-500' : ''
                      }`} />
                    </div>

                    {/* Expanded Details */}
                    {selectedTraveler?._id === traveler._id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {traveler.nationality && (
                            <span className="px-2 py-1 bg-white text-gray-600 rounded-lg text-xs border border-gray-200 font-medium">
                              🌍 {traveler.nationality}
                            </span>
                          )}
                          {traveler.travelStyle && (
                            <span className="px-2 py-1 bg-white text-gray-600 rounded-lg text-xs border border-gray-200 font-medium">
                              ✈️ {traveler.travelStyle}
                            </span>
                          )}
                          {traveler.gender && (
                            <span className="px-2 py-1 bg-white text-gray-600 rounded-lg text-xs border border-gray-200 font-medium">
                              {traveler.gender === 'Male' ? '👨' : traveler.gender === 'Female' ? '👩' : '🧑'} {traveler.gender}
                            </span>
                          )}
                        </div>
                        {traveler.bio && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{traveler.bio}</p>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/traveler/${traveler._id}`);
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                        >
                          <Users className="w-4 h-4" />
                          View Profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || loadingTravelers}
                    className="px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-sm"
                  >
                    ← Prev
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      Page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{pagination.totalPages}</span>
                    </span>
                    <span className="text-xs text-gray-400">
                      ({pagination.totalCount} total)
                    </span>
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasMore || loadingTravelers}
                    className="px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-sm"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Map Section */}
          <div className="flex-1 min-h-[500px] lg:min-h-0">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden h-full border border-gray-100">
              {/* Map Header */}
              <div className="bg-gradient-to-r from-gray-900 to-black text-white p-5 flex items-center justify-between relative overflow-hidden">
                <div className="relative flex items-center space-x-3">
                  <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                    <Navigation className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <span className="font-bold text-lg">Live Map View</span>
                    <p className="text-gray-400 text-xs">Real-time locations</p>
                  </div>
                </div>
                <div className="relative flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <Radio className="h-4 w-4 text-green-400 animate-pulse" />
                  <span className="text-sm font-medium text-gray-200">20 km</span>
                </div>
              </div>

              {/* Map Container */}
              <div className="h-[calc(100%-80px)] min-h-[450px] relative">
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={selectedTraveler?.currentLocation || userLocation || DEFAULT_CENTER}
                  zoom={userLocation ? 11 : 5}
                  options={{
                    ...mapOptions,
                    // If you want to force light mode even if user has system dark mode:
                    mapId: 'DEMO_MAP_ID', // Replace with valid map ID or remove if not using cloud styling
                  }}
                >
                  {userLocation && (
                    <>
                      <Marker
                        position={userLocation}
                        icon={getUserMarkerIcon()}
                        title="Your location"
                      />
                      <Circle
                        center={userLocation}
                        radius={radiusMeters}
                        options={{
                          fillColor: '#f9731633', // Orange-500 with opacity
                          strokeColor: '#f97316', // Orange-500
                          strokeOpacity: 0.8,
                          strokeWeight: 2
                        }}
                      />
                    </>
                  )}

                  {filteredTravelers.map((traveler) => (
                    <Marker
                      key={traveler._id}
                      position={{
                        lat: traveler.currentLocation?.lat,
                        lng: traveler.currentLocation?.lng
                      }}
                      title={`${traveler.fullName} — ${traveler.distanceKm} km away`}
                      onClick={() => setSelectedTraveler(traveler)}
                      label={{
                        text: traveler.fullName?.charAt(0)?.toUpperCase() || 'T',
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    />
                  ))}
                </GoogleMap>

                {/* Location Permission Overlay */}
                {!userLocation && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm text-center space-y-6 p-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full" />
                      <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-3xl shadow-2xl shadow-orange-500/20">
                        <LocateFixed className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2 max-w-md">
                      <p className="text-2xl font-bold text-gray-900">Location Access Required</p>
                      <p className="text-gray-500">Share your location to discover nearby travelers and explore the map</p>
                    </div>
                    <button
                      onClick={handleRetry}
                      className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 active:scale-95 flex items-center space-x-2"
                    >
                      <LocateFixed className="w-5 h-5" />
                      <span>Enable Location</span>
                    </button>
                  </div>
                )}

                {/* Selected Traveler Info Card */}
                {selectedTraveler && userLocation && (
                  <div className="absolute bottom-4 left-4 right-4 lg:left-4 lg:right-auto lg:max-w-sm bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 p-5 animate-slide-up">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center text-lg font-bold text-orange-500 shadow-md ring-2 ring-gray-100">
                          {selectedTraveler.profilePicture ? (
                            <img
                              src={selectedTraveler.profilePicture}
                              alt={selectedTraveler.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            selectedTraveler.fullName?.charAt(0)?.toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{selectedTraveler.fullName}</p>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <MapPin className="h-3.5 w-3.5 text-orange-500" />
                            <span className="font-medium">{selectedTraveler.distanceKm} km away</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedTraveler(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    {selectedTraveler.interests && selectedTraveler.interests.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedTraveler.interests.slice(0, 3).map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full border border-orange-100"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default AllTravelersOnMap;
