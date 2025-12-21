import { Circle,GoogleMap, Marker } from '@react-google-maps/api';
import {
  AlertCircle,
  ChevronRight,
  Clock,
  Filter,
  Landmark,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Radio,
  Search,
  Sliders,
  Star,
  Users,
  X} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useGoogleMaps } from '../context/GoogleMapsContext';
import { placesService } from '../redux/services/api';

// Tourist places will be fetched from Google Places API via backend

const containerStyle = {
  width: '100%',
  height: '100%'
};

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_RADIUS_KM = 20;
const MIN_RADIUS_KM = 5;
const MAX_RADIUS_KM = 100;

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

// Place Detail Modal Component
function PlaceDetailModal({ place, onClose }) {
  if (!place) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPERATIONAL':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">Open</span>;
      case 'CLOSED_TEMPORARILY':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/30">Temporarily Closed</span>;
      case 'CLOSED_PERMANENTLY':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/30">Permanently Closed</span>;
      default:
        return null;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Nature':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Religious':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Culture':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Historical':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-zinc-800 shadow-2xl animate-scale-in">
        {/* Header with close button */}
        <div className="relative">
          {/* Photo */}
          <div className="relative h-64 bg-zinc-800">
            <img
              src={place.image}
              alt={place.name}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 p-2 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          {/* Title and Status */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-white leading-tight">{place.name}</h2>
            {getStatusBadge(place.businessStatus)}
          </div>

          {/* Rating, Reviews, Category */}
          <div className="flex items-center flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-yellow-500">{place.rating}</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">{place.totalRatings?.toLocaleString()} reviews</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{place.distanceKm} km away</span>
            </div>
            {place.category && (
              <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(place.category)}`}>
                {place.category}
              </span>
            )}
          </div>

          {/* Address */}
          {place.vicinity && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">Address</h3>
              <p className="text-zinc-200">{place.vicinity}</p>
            </div>
          )}

          {/* Phone */}
          {place.phoneNumber && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">Contact</h3>
              <a
                href={`tel:${place.phoneNumber}`}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{place.phoneNumber}</span>
              </a>
            </div>
          )}

          {/* Opening Status */}
          {place.isOpen !== undefined && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">Status</h3>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className={place.isOpen ? 'text-green-400' : 'text-red-400'}>
                  {place.isOpen ? 'Open Now' : 'Currently Closed'}
                </span>
              </div>
            </div>
          )}

          {/* Get Directions Button */}
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${place.currentLocation?.lat},${place.currentLocation?.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20"
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

function TouristPlaces() {
  const { isLoaded } = useGoogleMaps();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [detailPlace, setDetailPlace] = useState(null);
  const [showList, setShowList] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [error, setError] = useState('');
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [showRadiusInput, setShowRadiusInput] = useState(false);

  const radiusMeters = radiusKm * 1000;

  const fetchNearbyPlaces = useCallback(async (lat, lng, radius) => {
    setLoadingPlaces(true);
    setError('');

    try {
      const response = await placesService.getNearbyTouristPlaces(lat, lng, radius);
      if (response.statusCode === 200) {
        setNearbyPlaces(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch places');
      }
    } catch (err) {
      console.error('Error fetching tourist places:', err);
      setError(err.response?.data?.message || 'Failed to fetch nearby places. Please try again.');
    } finally {
      setLoadingPlaces(false);
    }
  }, []);

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
        fetchNearbyPlaces(coords.lat, coords.lng, radiusKm * 1000);
      },
      (geoError) => {
        console.warn("Location denied, using default",geoError);
        const defaultCoords = DEFAULT_CENTER;
        setUserLocation(defaultCoords);
        setLoadingLocation(false);
        fetchNearbyPlaces(defaultCoords.lat, defaultCoords.lng, radiusKm * 1000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchNearbyPlaces]);

  const handleSearch = () => {
    if (userLocation) {
      fetchNearbyPlaces(userLocation.lat, userLocation.lng, radiusMeters);
    }
  };

  const filteredPlaces = useMemo(() => {
    return nearbyPlaces.filter((place) => {
      const name = place.name?.toLowerCase() || '';
      const category = (place.category || '').toLowerCase();
      return (
        name.includes(searchQuery.toLowerCase()) ||
        category.includes(searchQuery.toLowerCase())
      );
    });
  }, [nearbyPlaces, searchQuery]);

  const handleRetry = () => {
    setLoadingLocation(true);
    setError('');
    setNearbyPlaces([]);

    if (userLocation) {
        fetchNearbyPlaces(userLocation.lat, userLocation.lng);
        setLoadingLocation(false);
    } else {
         navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                setUserLocation(coords);
                setLoadingLocation(false);
                fetchNearbyPlaces(coords.lat, coords.lng);
            },
            () => {
                 const defaultCoords = DEFAULT_CENTER;
                 setUserLocation(defaultCoords);
                 setLoadingLocation(false);
                 fetchNearbyPlaces(defaultCoords.lat, defaultCoords.lng);
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

  const handlePlaceClick = (place) => {
    setDetailPlace(place);
  };

  const handleMapMarkerClick = (place) => {
    setSelectedPlace(place);
  };

  if (!isLoaded || loadingLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-zinc-800 text-center space-y-6 max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
            <Loader2 className="relative h-16 w-16 animate-spin text-blue-500 mx-auto" />
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-white">Exploring Places</p>
            <p className="text-zinc-400">Fetching your location and nearby attractions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-30">
      {/* Detail Modal */}
      {detailPlace && (
        <PlaceDetailModal place={detailPlace} onClose={() => setDetailPlace(null)} />
      )}

      {/* Enhanced Header */}
      <div className="bg-zinc-900/80 backdrop-blur-xl shadow-2xl border-b border-zinc-800 sticky top-0 z-20">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl" />
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                  <Landmark className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  Tourist Places
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                    <p className="text-sm font-medium text-zinc-300">
                      {filteredPlaces.length} nearby
                    </p>
                  </div>
                  <span className="text-zinc-700">•</span>
                  <p className="text-sm text-zinc-500">Within {radiusKm} km radius</p>
                </div>
              </div>
            </div>
            
            {/* Distance Filter Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRadiusInput(!showRadiusInput)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium ${
                  showRadiusInput 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <Sliders className="h-4 w-4" />
                <span className="hidden sm:inline">{radiusKm} km</span>
              </button>
              <button
                onClick={() => setShowList(!showList)}
                className="sm:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95"
              >
                {showList ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Distance Slider */}
          {showRadiusInput && (
            <div className="mb-5 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-zinc-300">Search Radius</span>
                <span className="text-lg font-bold text-purple-400">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min={MIN_RADIUS_KM}
                max={MAX_RADIUS_KM}
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-2">
                <span>{MIN_RADIUS_KM} km</span>
                <span>{MAX_RADIUS_KM} km</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <div className="relative group flex-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500 group-hover:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search places or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-3.5 bg-zinc-900 border-2 border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-zinc-100 placeholder-zinc-500 shadow-sm hover:shadow-md hover:border-zinc-700"
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={loadingPlaces}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loadingPlaces ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

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

      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)] gap-6 p-4 sm:p-6">
          <div
            className={`${
              showList ? 'block' : 'hidden'
            } lg:block lg:w-96 bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden`}
          >
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-zinc-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white text-lg">Nearby Attractions</h2>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/30">
                    {filteredPlaces.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[400px] lg:max-h-[calc(100vh-280px)] p-4 space-y-3">
              {loadingPlaces && (
                <div className="flex flex-col items-center justify-center py-12 text-blue-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <p className="text-sm font-medium text-zinc-400">Loading places...</p>
                </div>
              )}

              {!loadingPlaces && filteredPlaces.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-zinc-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-10 w-10 text-zinc-600" />
                  </div>
                  <p className="text-zinc-300 font-medium">No places found</p>
                  <p className="text-sm text-zinc-500 mt-2">Try adjusting your search criteria</p>
                </div>
              )}

              {filteredPlaces.map((place) => (
                <div
                  key={place._id}
                  onClick={() => handlePlaceClick(place)}
                  className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
                    selectedPlace?._id === place._id
                      ? 'bg-gradient-to-br from-blue-950/50 to-blue-900/30 shadow-lg shadow-blue-500/10 scale-[1.02] border-2 border-blue-500'
                      : 'bg-zinc-800/50 hover:bg-zinc-800 shadow-md hover:shadow-lg border-2 border-transparent hover:border-zinc-700'
                  }`}
                >
                  {selectedPlace?._id === place._id && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
                  )}

                  <div className="relative p-4">
                    <div className="flex items-start space-x-4">
                      {/* Place Image */}
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-800 shadow-lg ring-1 ring-zinc-700">
                           <img
                             src={place.image}
                             alt={place.name}
                             className="w-full h-full object-cover"
                           />
                        </div>
                      </div>

                      {/* Place Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                             <p className="font-semibold text-white truncate text-base group-hover:text-blue-400 transition-colors">
                            {place.name}
                            </p>
                            <div className="flex items-center bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                                <span className="text-xs font-bold text-yellow-500">{place.rating}</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 mt-1.5">
                          <div className="flex items-center space-x-1 text-sm text-zinc-300 bg-zinc-900/80 px-2 py-1 rounded-lg border border-zinc-700">
                            <MapPin className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-medium">{place.distanceKm} km</span>
                          </div>
                          {place.totalRatings > 0 && (
                            <div className="flex items-center space-x-1 text-sm text-zinc-400">
                              <Users className="h-3.5 w-3.5" />
                              <span className="text-xs">{place.totalRatings}</span>
                            </div>
                          )}
                        </div>
                        {place.category && (
                          <div className="mt-2 text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 inline-block">
                            {place.category}
                          </div>
                        )}
                      </div>

                      <ChevronRight className={`h-5 w-5 text-zinc-600 group-hover:text-blue-500 transition-all self-center ${
                        selectedPlace?._id === place._id ? 'translate-x-1 text-blue-500' : ''
                      }`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-[500px] lg:min-h-0">
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden h-full border border-zinc-800">
              <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-black text-white p-5 flex items-center justify-between relative overflow-hidden border-b border-zinc-800">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
                <div className="relative flex items-center space-x-3">
                  <div className="bg-blue-600/20 backdrop-blur-sm p-2 rounded-lg border border-blue-500/30">
                    <Navigation className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <span className="font-bold text-lg">Map View</span>
                    <p className="text-zinc-400 text-xs">Explore attractions</p>
                  </div>
                </div>
                <div className="relative flex items-center space-x-2 bg-blue-600/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-500/30">
                  <Radio className="h-4 w-4 text-green-400 animate-pulse" />
                  <span className="text-sm font-medium text-zinc-300">20 km</span>
                </div>
              </div>

              <div className="h-[calc(100%-80px)] min-h-[450px] relative">
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={selectedPlace?.currentLocation || userLocation || DEFAULT_CENTER}
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

                  {filteredPlaces.map((place) => (
                    <Marker
                      key={place._id}
                      position={{
                        lat: place.currentLocation?.lat,
                        lng: place.currentLocation?.lng
                      }}
                      title={place.name}
                      onClick={() => handleMapMarkerClick(place)}
                    />
                  ))}
                </GoogleMap>

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
                      <p className="text-zinc-400">Share your location to find nearby tourist places</p>
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

                {selectedPlace && userLocation && (
                  <div className="absolute bottom-4 left-4 right-4 lg:left-4 lg:right-auto lg:max-w-sm bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800 p-5 animate-slide-up">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                           <img
                             src={selectedPlace.image}
                             alt={selectedPlace.name}
                             className="w-full h-full object-cover"
                           />
                        </div>
                        <div>
                          <p className="font-bold text-white leading-tight">{selectedPlace.name}</p>
                          <div className="flex items-center space-x-1 text-sm text-zinc-400 mt-1">
                            <MapPin className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-medium">{selectedPlace.distanceKm} km away</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                              <span className="text-yellow-500 text-sm font-bold">{selectedPlace.rating}</span>
                            </div>
                            <span className="text-zinc-500 text-xs">({selectedPlace.totalRatings} reviews)</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedPlace(null)}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 hover:bg-zinc-800 rounded-lg"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <button
                      onClick={() => handlePlaceClick(selectedPlace)}
                      className="w-full mt-2 py-2 bg-blue-600/20 text-blue-400 font-medium rounded-lg border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
                    >
                      View Details
                    </button>
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
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default TouristPlaces;
