import { Circle, GoogleMap, Marker } from '@react-google-maps/api';
import {
  AlertCircle,
  ChevronRight,
  Clock,
  Filter,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Search,
  Star,
  Users,
  UtensilsCrossed,
  X
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { useGoogleMaps } from '../context/GoogleMapsContext';
import { placesService } from '../redux/services/api';

const containerStyle = { width: '100%', height: '100%' };
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_RADIUS = 20000; // 20km fixed radius

const mapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

// Placeholder component for places without photos
function PlaceholderImage({ category, className }) {
  const icons = { 'Cafe': '☕', 'Bar': '🍺', 'Nightclub': '🎉', 'Restaurant': '🍽️' };
  return (
    <div className={`${className} bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center`}>
      <span className="text-3xl">{icons[category] || '🍽️'}</span>
    </div>
  );
}

// Detail Modal Component
function PlaceDetailModal({ place, onClose }) {
  if (!place) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-100 shadow-2xl">
        <div className="relative h-64 bg-gray-100">
          {place.image ? (
            <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
          ) : (
            <PlaceholderImage category={place.category} className="w-full h-full" />
          )}
          <button onClick={onClose} className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full text-gray-700 shadow-sm transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{place.name}</h2>

          <div className="flex items-center flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-yellow-700">{place.rating}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Users className="w-4 h-4" />
              <span className="text-sm">{place.totalRatings?.toLocaleString()} reviews</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">{place.distanceKm} km away</span>
            </div>
          </div>

          {place.vicinity && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Address</h3>
              <p className="text-gray-700">{place.vicinity}</p>
            </div>
          )}

          {place.phoneNumber && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Contact</h3>
              <a href={`tel:${place.phoneNumber}`} className="flex items-center gap-2 text-orange-600 hover:text-orange-700">
                <Phone className="w-4 h-4" />
                <span>{place.phoneNumber}</span>
              </a>
            </div>
          )}

          {place.isOpen !== undefined && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Status</h3>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className={place.isOpen ? 'text-green-600' : 'text-red-600'}>
                  {place.isOpen ? 'Open Now' : 'Currently Closed'}
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${place.currentLocation?.lat},${place.currentLocation?.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/20"
            >
              <Navigation className="w-5 h-5" />
              Get Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function FoodNightlife() {
  const { isLoaded } = useGoogleMaps();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [detailPlace, setDetailPlace] = useState(null);
  const [showList, setShowList] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  
  // Separate states for nearby and search results
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  // Pagination
  const [nearbyNextToken, setNearbyNextToken] = useState(null);
  const [searchNextToken, setSearchNextToken] = useState(null);
  
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  // Fetch nearby places (radius-based)
  const fetchNearbyPlaces = useCallback(async (lat, lng, pageToken = null) => {
    if (pageToken) {
      setLoadingMore(true);
    } else {
      setLoadingPlaces(true);
    }
    setError('');
    
    try {
      const response = await placesService.getNearbyRestaurants({
        lat, lng, radius: DEFAULT_RADIUS, pageToken
      });
      
      if (response.statusCode === 200) {
        const { places, nextPageToken } = response.data;
        if (pageToken) {
          setNearbyPlaces(prev => [...prev, ...places]);
        } else {
          setNearbyPlaces(places || []);
        }
        setNearbyNextToken(nextPageToken);
      } else {
        setError(response.message || 'Failed to fetch places');
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError(err.response?.data?.message || 'Failed to fetch nearby restaurants.');
    } finally {
      setLoadingPlaces(false);
      setLoadingMore(false);
    }
  }, []);

  // Search places by name
  const searchPlaces = useCallback(async (lat, lng, query, pageToken = null) => {
    if (pageToken) {
      setLoadingMore(true);
    } else {
      setLoadingPlaces(true);
      setSearchResults([]);
    }
    setError('');
    
    try {
      const response = await placesService.getNearbyRestaurants({
        lat, lng, radius: DEFAULT_RADIUS, search: query, pageToken
      });
      
      if (response.statusCode === 200) {
        const { places, nextPageToken } = response.data;
        if (pageToken) {
          setSearchResults(prev => [...prev, ...places]);
        } else {
          setSearchResults(places || []);
        }
        setSearchNextToken(nextPageToken);
      } else {
        setError(response.message || 'Failed to search places');
      }
    } catch (err) {
      console.error('Error searching restaurants:', err);
      setError(err.response?.data?.message || 'Failed to search restaurants.');
    } finally {
      setLoadingPlaces(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported.');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(coords);
        setLoadingLocation(false);
        fetchNearbyPlaces(coords.lat, coords.lng);
      },
      () => {
        setUserLocation(DEFAULT_CENTER);
        setLoadingLocation(false);
        fetchNearbyPlaces(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    if (!userLocation) return;
    
    const query = searchQuery.trim();
    if (query) {
      setIsSearchMode(true);
      searchPlaces(userLocation.lat, userLocation.lng, query);
    } else {
      setIsSearchMode(false);
      setSearchResults([]);
      setSearchNextToken(null);
      fetchNearbyPlaces(userLocation.lat, userLocation.lng);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchMode(false);
    setSearchResults([]);
    setSearchNextToken(null);
    if (userLocation) {
      fetchNearbyPlaces(userLocation.lat, userLocation.lng);
    }
  };

  const handleLoadMore = () => {
    if (!userLocation) return;
    
    if (isSearchMode && searchNextToken) {
      searchPlaces(userLocation.lat, userLocation.lng, searchQuery, searchNextToken);
    } else if (!isSearchMode && nearbyNextToken) {
      fetchNearbyPlaces(userLocation.lat, userLocation.lng, nearbyNextToken);
    }
  };

  const handleRetry = () => {
    if (userLocation) {
      if (isSearchMode) {
        searchPlaces(userLocation.lat, userLocation.lng, searchQuery);
      } else {
        fetchNearbyPlaces(userLocation.lat, userLocation.lng);
      }
    }
  };

  const getUserMarkerIcon = () => {
    if (!window.google) return undefined;
    return { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#f97316', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 3 };
  };

  const displayedPlaces = isSearchMode ? searchResults : nearbyPlaces;
  const hasNextPage = isSearchMode ? searchNextToken : nearbyNextToken;

  if (!isLoaded || loadingLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-gray-100 text-center space-y-6 max-w-md">
          <Loader2 className="h-16 w-16 animate-spin text-orange-500 mx-auto" />
          <p className="text-2xl font-bold text-gray-900">Finding Restaurants</p>
          <p className="text-gray-500">Fetching nearby food & nightlife spots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pt-28 pb-12">
      {detailPlace && <PlaceDetailModal place={detailPlace} onClose={() => setDetailPlace(null)} />}

      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-2xl" />
                <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-2xl shadow-lg shadow-orange-500/20">
                  <UtensilsCrossed className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Food & Nightlife
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-sm font-medium text-gray-600">
                    {isSearchMode ? `${displayedPlaces.length} search results` : `${displayedPlaces.length} nearby`}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={() => setShowList(!showList)} className="sm:hidden bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-xl border border-orange-100">
              {showList ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by restaurant name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-400 shadow-sm"
              />
              {searchQuery && (
                <button onClick={handleClearSearch} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={loadingPlaces}
              className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-orange-500/20"
            >
              {loadingPlaces ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-center space-x-3 bg-red-50 border-l-4 border-red-500 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-600">{error}</p>
              <button onClick={handleRetry} className="text-red-700 font-semibold hover:underline">Retry</button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-250px)] gap-6 p-4 sm:p-6">
          <div className={`${showList ? 'block' : 'hidden'} lg:block lg:w-96 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl overflow-hidden`}>
            <div className="bg-gradient-to-r from-orange-50 to-white border-b border-gray-100 px-6 py-4">
              <h2 className="font-bold text-gray-900 text-lg">
                {isSearchMode ? '🔍 Search Results' : '📍 Nearby Places'}
              </h2>
              {isSearchMode && <p className="text-sm text-gray-500 mt-1">Results for "{searchQuery}"</p>}
            </div>

            <div className="overflow-y-auto max-h-[400px] lg:max-h-[calc(100vh-320px)] p-4 space-y-3">
              {loadingPlaces && (
                <div className="flex flex-col items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              )}

              {!loadingPlaces && displayedPlaces.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-900">No places found</p>
                  {isSearchMode && <p className="text-sm text-gray-500 mt-2">Try a different search term</p>}
                </div>
              )}

              {displayedPlaces.map((place) => (
                <div
                  key={place._id}
                  onClick={() => setDetailPlace(place)}
                  className="group relative overflow-hidden rounded-xl cursor-pointer transition-all bg-white hover:bg-orange-50 border border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-md p-4"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {place.image ? (
                        <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                      ) : (
                        <PlaceholderImage category={place.category} className="w-full h-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-gray-900 truncate group-hover:text-orange-600">{place.name}</p>
                        <div className="flex items-center bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                          <span className="text-xs font-bold text-yellow-700">{place.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                          <MapPin className="h-3.5 w-3.5 text-orange-500 mr-1" />
                          <span>{place.distanceKm} km</span>
                        </div>
                        {place.category && (
                          <span className="text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{place.category}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-500 self-center" />
                  </div>
                </div>
              ))}

              {hasNextPage && !loadingPlaces && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full py-3 bg-white hover:bg-gray-50 text-gray-600 font-medium rounded-xl border border-gray-200 shadow-sm flex items-center justify-center gap-2"
                >
                  {loadingMore ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</> : 'Load More'}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-[500px] lg:min-h-0">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden h-full border border-gray-100">
              <div className="bg-gradient-to-r from-gray-900 to-black text-white p-5 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                    <Navigation className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <span className="font-bold text-lg">Map View</span>
                    <p className="text-gray-400 text-xs">Explore food spots</p>
                  </div>
                </div>
              </div>

              <div className="h-[calc(100%-80px)] min-h-[450px] relative">
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={selectedPlace?.currentLocation || userLocation || DEFAULT_CENTER}
                  zoom={userLocation ? 12 : 5}
                  options={{ ...mapOptions }}
                >
                  {userLocation && (
                    <>
                      <Marker position={userLocation} icon={getUserMarkerIcon()} title="Your location" />
                      <Circle center={userLocation} radius={DEFAULT_RADIUS} options={{ fillColor: '#f9731633', strokeColor: '#f97316', strokeOpacity: 0.8, strokeWeight: 2 }} />
                    </>
                  )}
                  {displayedPlaces.map((place) => (
                    <Marker
                      key={place._id}
                      position={{ lat: place.currentLocation?.lat, lng: place.currentLocation?.lng }}
                      title={place.name}
                      onClick={() => setSelectedPlace(place)}
                    />
                  ))}
                </GoogleMap>

                {selectedPlace && userLocation && (
                  <div className="absolute bottom-4 left-4 right-4 lg:right-auto lg:max-w-sm bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          {selectedPlace.image ? (
                            <img src={selectedPlace.image} alt={selectedPlace.name} className="w-full h-full object-cover" />
                          ) : (
                            <PlaceholderImage category={selectedPlace.category} className="w-full h-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{selectedPlace.name}</p>
                          <p className="text-sm text-gray-500">{selectedPlace.distanceKm} km away</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedPlace(null)} className="text-gray-400 hover:text-gray-600 p-1">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <button onClick={() => setDetailPlace(selectedPlace)} className="w-full py-2 bg-orange-50 text-orange-600 font-medium rounded-lg border border-orange-100 hover:bg-orange-100">
                      View Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodNightlife;
