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

// Dark theme map styles
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }]
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }]
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#181818" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }]
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c2c2c" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a8a8a" }]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#373737" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3c3c3c" }]
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [{ color: "#4e4e4e" }]
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }]
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d3d3d" }]
  }
];

function AllTravelersOnMap() {
  const { isLoaded } = useGoogleMaps();
  const { getToken } = useAuth();

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
      <div className="min-h-screen flex items-center justify-center bg-black ">
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-zinc-800 text-center space-y-6 max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
            <Loader2 className="relative h-16 w-16 animate-spin text-blue-500 mx-auto" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-white">Preparing Your Map</p>
            <p className="text-zinc-400">Fetching your location and nearby travelers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black  pt-30">
      {/* Enhanced Header */}
      <div className="bg-zinc-900/80 backdrop-blur-xl shadow-2xl border-b border-zinc-800 sticky top-0 z-20">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl" />
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  Nearby Travelers
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                    <p className="text-sm font-medium text-zinc-300">
                      {filteredTravelers.length} found
                    </p>
                  </div>
                  <span className="text-zinc-700">•</span>
                  <p className="text-sm text-zinc-500">Within {radiusKm} km radius</p>
                </div>
              </div>
            </div>
            
            {/* Mobile List Toggle */}
            <button
              onClick={() => setShowList(!showList)}
              className="sm:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95"
            >
              {showList ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
            </button>
          </div>

          {/* Search Bar with Global Toggle */}
          <div className="flex gap-3 mb-4">
            <div className="relative group flex-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500 group-hover:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder={globalSearch ? "Search by name (worldwide)..." : "Search by name or interests..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-900 border-2 border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-zinc-100 placeholder-zinc-500 shadow-sm hover:shadow-md hover:border-zinc-700"
                />
              </div>
            </div>
            
            {/* Global Search Toggle Button */}
            <button
              onClick={() => setGlobalSearch(!globalSearch)}
              title={globalSearch ? "Switch to nearby search" : "Switch to global search"}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap ${
                globalSearch 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/30' 
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
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
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            <div className="flex items-center gap-4 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <MapPin className="h-4 w-4 text-purple-400" />
                <span>Radius:</span>
              </div>
              <input
                type="range"
                min={MIN_RADIUS_KM}
                max={MAX_RADIUS_KM}
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <span className="text-sm font-bold text-purple-400 min-w-[60px] text-right">{radiusKm} km</span>
            </div>
          )}
          
          {globalSearch && (
            <div className="flex items-center gap-2 p-3 bg-green-900/30 rounded-xl border border-green-700/50 text-green-400 text-sm">
              <span className="text-lg">🌍</span>
              <span>Searching worldwide - no distance limit</span>
            </div>
          )}



          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-start space-x-3 text-sm bg-red-950/50 border-l-4 border-red-500 rounded-xl p-4 shadow-sm backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-300">Error</p>
                <p className="text-red-400 mt-0.5">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="text-blue-400 font-semibold hover:text-blue-300 hover:underline transition-colors whitespace-nowrap"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)] gap-6 p-4 sm:p-6">
          {/* Enhanced Sidebar */}
          <div
            className={`${
              showList ? 'block' : 'hidden'
            } lg:block lg:w-96 bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden`}
          >
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-zinc-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white text-lg">Active Travelers</h2>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/30">
                    {filteredTravelers.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[400px] lg:max-h-[calc(100vh-280px)] p-4 space-y-3">
              {loadingTravelers && (
                <div className="flex flex-col items-center justify-center py-12 text-blue-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <p className="text-sm font-medium text-zinc-400">Loading travelers...</p>
                </div>
              )}

              {!loadingTravelers && filteredTravelers.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-zinc-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-10 w-10 text-zinc-600" />
                  </div>
                  <p className="text-zinc-300 font-medium">No travelers found</p>
                  <p className="text-sm text-zinc-500 mt-2">Try adjusting your search criteria</p>
                </div>
              )}

              {filteredTravelers.map((traveler) => (
                <div
                  key={traveler._id}
                  onClick={() => setSelectedTraveler(traveler)}
                  className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
                    selectedTraveler?._id === traveler._id
                      ? 'bg-gradient-to-br from-blue-950/50 to-blue-900/30 shadow-lg shadow-blue-500/10 scale-[1.02] border-2 border-blue-500'
                      : 'bg-zinc-800/50 hover:bg-zinc-800 shadow-md hover:shadow-lg border-2 border-transparent hover:border-zinc-700'
                  }`}
                >
                  {selectedTraveler?._id === traveler._id && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
                  )}

                  <div className="relative p-4">
                    <div className="flex items-center space-x-4">
                      {/* Profile Picture */}
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-xl font-bold text-white shadow-lg ring-4 ring-zinc-900">
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
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-zinc-900 shadow-lg">
                          <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-75" />
                        </div>
                      </div>

                      {/* Traveler Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate text-base group-hover:text-blue-400 transition-colors">
                          {traveler.fullName}
                        </p>
                        <div className="flex items-center space-x-2 mt-1.5">
                          {traveler.distanceKm !== null ? (
                            <div className="flex items-center space-x-1 text-sm text-zinc-300 bg-zinc-900/80 px-2 py-1 rounded-lg border border-zinc-700">
                              <MapPin className="h-3.5 w-3.5 text-blue-500" />
                              <span className="font-medium">{traveler.distanceKm} km</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-sm text-zinc-400 bg-zinc-900/80 px-2 py-1 rounded-lg border border-zinc-700">
                              <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                              <span className="font-medium">--</span>
                            </div>
                          )}
                          {traveler.interests && traveler.interests.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                              <span className="text-xs text-zinc-500 truncate max-w-[100px]">
                                {traveler.interests[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Arrow Icon */}
                      <ChevronRight className={`h-5 w-5 text-zinc-600 group-hover:text-blue-500 transition-all ${
                        selectedTraveler?._id === traveler._id ? 'translate-x-1 text-blue-500' : ''
                      }`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || loadingTravelers}
                    className="px-3 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  >
                    ← Prev
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-400">
                      Page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{pagination.totalPages}</span>
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({pagination.totalCount} total)
                    </span>
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasMore || loadingTravelers}
                    className="px-3 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Map Section */}
          <div className="flex-1 min-h-[500px] lg:min-h-0">
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden h-full border border-zinc-800">
              {/* Map Header */}
              <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-black text-white p-5 flex items-center justify-between relative overflow-hidden border-b border-zinc-800">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
                <div className="relative flex items-center space-x-3">
                  <div className="bg-blue-600/20 backdrop-blur-sm p-2 rounded-lg border border-blue-500/30">
                    <Navigation className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <span className="font-bold text-lg">Live Map View</span>
                    <p className="text-zinc-400 text-xs">Real-time locations</p>
                  </div>
                </div>
                <div className="relative flex items-center space-x-2 bg-blue-600/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-500/30">
                  <Radio className="h-4 w-4 text-green-400 animate-pulse" />
                  <span className="text-sm font-medium text-zinc-300">20 km</span>
                </div>
              </div>

              {/* Map Container */}
              <div className="h-[calc(100%-80px)] min-h-[450px] relative">
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={selectedTraveler?.currentLocation || userLocation || DEFAULT_CENTER}
                  zoom={userLocation ? 11 : 5}
                  options={{
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                    styles: darkMapStyles
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
                          fillColor: '#3b82f633',
                          strokeColor: '#3b82f6',
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-950/95 to-black/95 backdrop-blur-lg text-center space-y-6 p-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                      <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-3xl shadow-2xl shadow-blue-500/20">
                        <LocateFixed className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2 max-w-md">
                      <p className="text-2xl font-bold text-white">Location Access Required</p>
                      <p className="text-zinc-400">Share your location to discover nearby travelers and explore the map</p>
                    </div>
                    <button
                      onClick={handleRetry}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 flex items-center space-x-2"
                    >
                      <LocateFixed className="w-5 h-5" />
                      <span>Enable Location</span>
                    </button>
                  </div>
                )}

                {/* Selected Traveler Info Card */}
                {selectedTraveler && userLocation && (
                  <div className="absolute bottom-4 left-4 right-4 lg:left-4 lg:right-auto lg:max-w-sm bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800 p-5 animate-slide-up">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-lg font-bold text-white shadow-lg">
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
                          <p className="font-bold text-white">{selectedTraveler.fullName}</p>
                          <div className="flex items-center space-x-1 text-sm text-zinc-400">
                            <MapPin className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-medium">{selectedTraveler.distanceKm} km away</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedTraveler(null)}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 hover:bg-zinc-800 rounded-lg"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    {selectedTraveler.interests && selectedTraveler.interests.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedTraveler.interests.slice(0, 3).map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30"
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
