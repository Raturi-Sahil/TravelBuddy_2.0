import { Circle, GoogleMap, Marker } from '@react-google-maps/api';
import {
  AlertCircle,
  ChevronRight,
  Clock,
  Filter,
  Hotel,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Search,
  Star,
  Users,
  X
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { useGoogleMaps } from '../context/GoogleMapsContext';
import { placesService } from '../redux/services/api';

const containerStyle = { width: '100%', height: '100%' };
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_RADIUS = 20000;

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
];

function PlaceholderImage({ className }) {
  return (
    <div className={`${className} bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center`}>
      <span className="text-3xl">🏨</span>
    </div>
  );
}

function HotelDetailModal({ hotel, onClose }) {
  if (!hotel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-zinc-800 shadow-2xl">
        <div className="relative h-64 bg-zinc-800">
          {hotel.image ? (
            <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
          ) : (
            <PlaceholderImage className="w-full h-full" />
          )}
          <button onClick={onClose} className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 p-2 rounded-full text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          <h2 className="text-2xl font-bold text-white mb-4">{hotel.name}</h2>

          <div className="flex items-center flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-yellow-500">{hotel.rating}</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">{hotel.totalRatings?.toLocaleString()} reviews</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{hotel.distanceKm} km away</span>
            </div>
          </div>

          {hotel.vicinity && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase mb-2">Address</h3>
              <p className="text-zinc-200">{hotel.vicinity}</p>
            </div>
          )}

          {hotel.phoneNumber && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase mb-2">Contact</h3>
              <a href={`tel:${hotel.phoneNumber}`} className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
                <Phone className="w-4 h-4" />
                <span>{hotel.phoneNumber}</span>
              </a>
            </div>
          )}

          {hotel.isOpen !== undefined && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase mb-2">Status</h3>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className={hotel.isOpen ? 'text-green-400' : 'text-red-400'}>
                  {hotel.isOpen ? 'Open Now' : 'Currently Closed'}
                </span>
              </div>
            </div>
          )}

          {hotel.amenities?.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase mb-2">Features</h3>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((am, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-sm rounded-lg border border-zinc-700">{am}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-zinc-800">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${hotel.currentLocation?.lat},${hotel.currentLocation?.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800"
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

function NearbyHotels() {
  const { isLoaded } = useGoogleMaps();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [detailHotel, setDetailHotel] = useState(null);
  const [showList, setShowList] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  
  const [nearbyHotels, setNearbyHotels] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  const [nearbyNextToken, setNearbyNextToken] = useState(null);
  const [searchNextToken, setSearchNextToken] = useState(null);
  
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const fetchNearbyHotels = useCallback(async (lat, lng, pageToken = null) => {
    if (pageToken) setLoadingMore(true);
    else setLoadingHotels(true);
    setError('');
    
    try {
      const response = await placesService.getNearbyHotels({ lat, lng, radius: DEFAULT_RADIUS, pageToken });
      if (response.statusCode === 200) {
        const { places, nextPageToken } = response.data;
        if (pageToken) setNearbyHotels(prev => [...prev, ...places]);
        else setNearbyHotels(places || []);
        setNearbyNextToken(nextPageToken);
      } else {
        setError(response.message || 'Failed to fetch hotels');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch nearby hotels.');
    } finally {
      setLoadingHotels(false);
      setLoadingMore(false);
    }
  }, []);

  const searchHotels = useCallback(async (lat, lng, query, pageToken = null) => {
    if (pageToken) setLoadingMore(true);
    else { setLoadingHotels(true); setSearchResults([]); }
    setError('');
    
    try {
      const response = await placesService.getNearbyHotels({ lat, lng, radius: DEFAULT_RADIUS, search: query, pageToken });
      if (response.statusCode === 200) {
        const { places, nextPageToken } = response.data;
        if (pageToken) setSearchResults(prev => [...prev, ...places]);
        else setSearchResults(places || []);
        setSearchNextToken(nextPageToken);
      } else {
        setError(response.message || 'Failed to search hotels');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search hotels.');
    } finally {
      setLoadingHotels(false);
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
        fetchNearbyHotels(coords.lat, coords.lng);
      },
      () => {
        setUserLocation(DEFAULT_CENTER);
        setLoadingLocation(false);
        fetchNearbyHotels(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
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
      searchHotels(userLocation.lat, userLocation.lng, query);
    } else {
      setIsSearchMode(false);
      setSearchResults([]);
      setSearchNextToken(null);
      fetchNearbyHotels(userLocation.lat, userLocation.lng);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchMode(false);
    setSearchResults([]);
    setSearchNextToken(null);
    if (userLocation) fetchNearbyHotels(userLocation.lat, userLocation.lng);
  };

  const handleLoadMore = () => {
    if (!userLocation) return;
    if (isSearchMode && searchNextToken) searchHotels(userLocation.lat, userLocation.lng, searchQuery, searchNextToken);
    else if (!isSearchMode && nearbyNextToken) fetchNearbyHotels(userLocation.lat, userLocation.lng, nearbyNextToken);
  };

  const handleRetry = () => {
    if (userLocation) {
      if (isSearchMode) searchHotels(userLocation.lat, userLocation.lng, searchQuery);
      else fetchNearbyHotels(userLocation.lat, userLocation.lng);
    }
  };

  const getUserMarkerIcon = () => {
    if (!window.google) return undefined;
    return { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#3b82f6', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 3 };
  };

  const displayedHotels = isSearchMode ? searchResults : nearbyHotels;
  const hasNextPage = isSearchMode ? searchNextToken : nearbyNextToken;

  if (!isLoaded || loadingLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-zinc-800 text-center space-y-6 max-w-md">
          <Loader2 className="h-16 w-16 animate-spin text-blue-500 mx-auto" />
          <p className="text-2xl font-bold text-white">Finding Hotels</p>
          <p className="text-zinc-400">Fetching your location and nearby stays...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-30">
      {detailHotel && <HotelDetailModal hotel={detailHotel} onClose={() => setDetailHotel(null)} />}

      <div className="bg-zinc-900/80 backdrop-blur-xl shadow-2xl border-b border-zinc-800 sticky top-0 z-20">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl" />
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                  <Hotel className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  Nearby Hotels
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-sm font-medium text-zinc-300">
                    {isSearchMode ? `${displayedHotels.length} search results` : `${displayedHotels.length} available`}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={() => setShowList(!showList)} className="sm:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-xl">
              {showList ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by hotel name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-10 py-3.5 bg-zinc-900 border-2 border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 text-zinc-100 placeholder-zinc-500"
              />
              {searchQuery && (
                <button onClick={handleClearSearch} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={loadingHotels}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center gap-2"
            >
              {loadingHotels ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-center space-x-3 bg-red-950/50 border-l-4 border-red-500 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
              <button onClick={handleRetry} className="text-blue-400 font-semibold">Retry</button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)] gap-6 p-4 sm:p-6">
          <div className={`${showList ? 'block' : 'hidden'} lg:block lg:w-96 bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden`}>
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-zinc-800 px-6 py-4">
              <h2 className="font-bold text-white text-lg">
                {isSearchMode ? '🔍 Search Results' : '📍 Nearby Hotels'}
              </h2>
              {isSearchMode && <p className="text-sm text-zinc-400 mt-1">Results for "{searchQuery}"</p>}
            </div>

            <div className="overflow-y-auto max-h-[400px] lg:max-h-[calc(100vh-280px)] p-4 space-y-3">
              {loadingHotels && (
                <div className="flex flex-col items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
                  <p className="text-sm text-zinc-400">Loading hotels...</p>
                </div>
              )}

              {!loadingHotels && displayedHotels.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-300">No hotels found</p>
                  {isSearchMode && <p className="text-sm text-zinc-500 mt-2">Try a different search term</p>}
                </div>
              )}

              {displayedHotels.map((hotel) => (
                <div
                  key={hotel._id}
                  onClick={() => setDetailHotel(hotel)}
                  className="group rounded-xl cursor-pointer transition-all bg-zinc-800/50 hover:bg-zinc-800 border-2 border-transparent hover:border-blue-500/50 p-4"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                      {hotel.image ? (
                        <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                      ) : (
                        <PlaceholderImage className="w-full h-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-white truncate group-hover:text-blue-400">{hotel.name}</p>
                        <div className="flex items-center bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                          <span className="text-xs font-bold text-yellow-500">{hotel.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <div className="flex items-center text-sm text-zinc-300 bg-zinc-900/80 px-2 py-1 rounded-lg">
                          <MapPin className="h-3.5 w-3.5 text-blue-500 mr-1" />
                          <span>{hotel.distanceKm} km</span>
                        </div>
                      </div>
                      {hotel.amenities?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {hotel.amenities.slice(0, 2).map((am, idx) => (
                            <span key={idx} className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">{am}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-blue-500 self-center" />
                  </div>
                </div>
              ))}

              {hasNextPage && !loadingHotels && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl border border-zinc-700 flex items-center justify-center gap-2"
                >
                  {loadingMore ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</> : 'Load More'}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-[500px] lg:min-h-0">
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden h-full border border-zinc-800">
              <div className="bg-gradient-to-r from-zinc-900 to-black text-white p-5 flex items-center space-x-3 border-b border-zinc-800">
                <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
                  <Navigation className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <span className="font-bold text-lg">Map View</span>
                  <p className="text-zinc-400 text-xs">Explore stays</p>
                </div>
              </div>

              <div className="h-[calc(100%-80px)] min-h-[450px] relative">
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={selectedHotel?.currentLocation || userLocation || DEFAULT_CENTER}
                  zoom={userLocation ? 12 : 5}
                  options={{ zoomControl: true, streetViewControl: false, mapTypeControl: false, fullscreenControl: true, styles: darkMapStyles }}
                >
                  {userLocation && (
                    <>
                      <Marker position={userLocation} icon={getUserMarkerIcon()} title="Your location" />
                      <Circle center={userLocation} radius={DEFAULT_RADIUS} options={{ fillColor: '#3b82f633', strokeColor: '#3b82f6', strokeOpacity: 0.8, strokeWeight: 2 }} />
                    </>
                  )}
                  {displayedHotels.map((hotel) => (
                    <Marker
                      key={hotel._id}
                      position={{ lat: hotel.currentLocation?.lat, lng: hotel.currentLocation?.lng }}
                      title={hotel.name}
                      onClick={() => setSelectedHotel(hotel)}
                    />
                  ))}
                </GoogleMap>

                {selectedHotel && userLocation && (
                  <div className="absolute bottom-4 left-4 right-4 lg:right-auto lg:max-w-sm bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-800">
                          {selectedHotel.image ? (
                            <img src={selectedHotel.image} alt={selectedHotel.name} className="w-full h-full object-cover" />
                          ) : (
                            <PlaceholderImage className="w-full h-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white">{selectedHotel.name}</p>
                          <p className="text-sm text-zinc-400">{selectedHotel.distanceKm} km away</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedHotel(null)} className="text-zinc-500 hover:text-zinc-300 p-1">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <button onClick={() => setDetailHotel(selectedHotel)} className="w-full py-2 bg-blue-600/20 text-blue-400 font-medium rounded-lg border border-blue-500/30 hover:bg-blue-600/30">
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

export default NearbyHotels;
