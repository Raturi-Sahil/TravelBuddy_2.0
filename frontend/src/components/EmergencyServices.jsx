import { Circle, GoogleMap, Marker } from '@react-google-maps/api';
import { AlertCircle, ChevronRight, Clock, Filter, Loader2, MapPin, Navigation, Phone, Search, Shield, Star, Users, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { useGoogleMaps } from '../context/GoogleMapsContext';
import { placesService } from '../redux/services/api';

const containerStyle = { width: '100%', height: '100%' };
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_RADIUS = 20000;
const mapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

function Placeholder({ category, className }) {
  const icons = { 'Hospital': '🏥', 'Pharmacy': '💊', 'Police': '👮', 'Fire Station': '🚒', 'ATM': '🏧', 'Bank': '🏦' };
  return (
    <div className={`${className} bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center`}>
      <span className="text-3xl">{icons[category] || '🆘'}</span>
    </div>
  );
}

function DetailModal({ place, onClose }) {
  if (!place) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-100 shadow-2xl">
        <div className="relative h-64 bg-gray-100">
          {place.image ? (
            <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
          ) : (
            <Placeholder category={place.category} className="w-full h-full" />
          )}
          <button onClick={onClose} className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full text-gray-700 shadow-sm transition-all"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{place.name}</h2>
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /><span className="font-bold text-yellow-700">{place.rating}</span></div>
            <div className="flex items-center gap-1.5 text-gray-500"><MapPin className="w-4 h-4 text-orange-500" /><span className="text-sm">{place.distanceKm} km</span></div>
            {place.category && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">{place.category}</span>}
          </div>
          {place.vicinity && <div className="mb-5"><h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Address</h3><p className="text-gray-700">{place.vicinity}</p></div>}
          {place.phoneNumber && <div className="mb-5"><a href={`tel:${place.phoneNumber}`} className="flex items-center gap-2 text-orange-600 hover:text-orange-700"><Phone className="w-4 h-4" />{place.phoneNumber}</a></div>}
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.currentLocation?.lat},${place.currentLocation?.lng}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/20"><Navigation className="w-5 h-5" />Get Directions</a>
        </div>
      </div>
    </div>
  );
}

function EmergencyServices() {
  const { isLoaded } = useGoogleMaps();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [detailPlace, setDetailPlace] = useState(null);
  const [showList, setShowList] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [nearbyNextToken, setNearbyNextToken] = useState(null);
  const [searchNextToken, setSearchNextToken] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const fetchNearbyPlaces = useCallback(async (lat, lng, pageToken = null) => {
    pageToken ? setLoadingMore(true) : setLoadingPlaces(true);
    setError('');
    try {
      const response = await placesService.getNearbyEmergency({ lat, lng, radius: DEFAULT_RADIUS, pageToken });
      if (response.statusCode === 200) {
        const { places, nextPageToken } = response.data;
        pageToken ? setNearbyPlaces(prev => [...prev, ...places]) : setNearbyPlaces(places || []);
        setNearbyNextToken(nextPageToken);
      } else setError(response.message);
    } catch (err) { setError('Failed to fetch emergency services.'); }
    finally { setLoadingPlaces(false); setLoadingMore(false); }
  }, []);

  const searchPlaces = useCallback(async (lat, lng, query, pageToken = null) => {
    pageToken ? setLoadingMore(true) : (setLoadingPlaces(true), setSearchResults([]));
    setError('');
    try {
      const response = await placesService.getNearbyEmergency({ lat, lng, radius: DEFAULT_RADIUS, search: query, pageToken });
      if (response.statusCode === 200) {
        const { places, nextPageToken } = response.data;
        pageToken ? setSearchResults(prev => [...prev, ...places]) : setSearchResults(places || []);
        setSearchNextToken(nextPageToken);
      } else setError(response.message);
    } catch (err) { setError('Failed to search.'); }
    finally { setLoadingPlaces(false); setLoadingMore(false); }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) { setError('Geolocation not supported.'); setLoadingLocation(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setUserLocation(c); setLoadingLocation(false); fetchNearbyPlaces(c.lat, c.lng); },
      () => { setUserLocation(DEFAULT_CENTER); setLoadingLocation(false); fetchNearbyPlaces(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng); }
    );
  }, []);

  const handleSearch = () => {
    if (!userLocation) return;
    const q = searchQuery.trim();
    if (q) { setIsSearchMode(true); searchPlaces(userLocation.lat, userLocation.lng, q); }
    else { setIsSearchMode(false); setSearchResults([]); fetchNearbyPlaces(userLocation.lat, userLocation.lng); }
  };

  const handleClearSearch = () => { setSearchQuery(''); setIsSearchMode(false); setSearchResults([]); if (userLocation) fetchNearbyPlaces(userLocation.lat, userLocation.lng); };
  const handleLoadMore = () => { if (!userLocation) return; isSearchMode && searchNextToken ? searchPlaces(userLocation.lat, userLocation.lng, searchQuery, searchNextToken) : nearbyNextToken && fetchNearbyPlaces(userLocation.lat, userLocation.lng, nearbyNextToken); };
  const getUserMarkerIcon = () => window.google ? { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#f97316', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 } : undefined;
  const displayedPlaces = isSearchMode ? searchResults : nearbyPlaces;
  const hasNextPage = isSearchMode ? searchNextToken : nearbyNextToken;

  if (!isLoaded || loadingLocation) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100"><Loader2 className="h-16 w-16 animate-spin text-orange-500" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pt-28 pb-12">
      {detailPlace && <DetailModal place={detailPlace} onClose={() => setDetailPlace(null)} />}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-2xl" />
                <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-2xl shadow-lg shadow-orange-500/20">
                  <Shield className="h-7 w-7 text-white" />
                </div>
              </div>
              <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Emergency Services</h1><div className="flex items-center space-x-2 mt-1"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><p className="text-sm font-medium text-gray-600">{isSearchMode ? `${displayedPlaces.length} results` : `${displayedPlaces.length} nearby`}</p></div></div>
            </div>
            <button onClick={() => setShowList(!showList)} className="sm:hidden bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-xl border border-orange-100">{showList ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}</button>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" placeholder="Search hospitals, pharmacies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="w-full pl-12 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 placeholder-gray-400 shadow-sm" />
              {searchQuery && <button onClick={handleClearSearch} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>}
            </div>
            <button onClick={handleSearch} disabled={loadingPlaces} className="px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-orange-500/20">{loadingPlaces ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}<span className="hidden sm:inline">Search</span></button>
          </div>
          {error && <div className="mt-4 flex items-center space-x-3 bg-red-50 border-l-4 border-red-500 rounded-xl p-4"><AlertCircle className="w-5 h-5 text-red-500" /><p className="text-red-600">{error}</p></div>}
        </div>
      </div>
      <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row gap-6 p-4 sm:p-6">
        <div className={`${showList ? 'block' : 'hidden'} lg:block lg:w-96 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl overflow-hidden`}>
          <div className="bg-gradient-to-r from-orange-50 to-white border-b border-gray-100 px-6 py-4"><h2 className="font-bold text-gray-900 text-lg">{isSearchMode ? '🔍 Search Results' : '📍 Nearby Services'}</h2>{isSearchMode && <p className="text-sm text-gray-500 mt-1">Results for "{searchQuery}"</p>}</div>
          <div className="overflow-y-auto max-h-[400px] lg:max-h-[calc(100vh-320px)] p-4 space-y-3">
            {loadingPlaces && <div className="flex flex-col items-center py-12"><Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" /><p className="text-sm text-gray-500">Loading...</p></div>}
            {!loadingPlaces && displayedPlaces.length === 0 && <div className="text-center py-12"><Search className="h-10 w-10 text-gray-400 mx-auto mb-4" /><p className="text-gray-900">No services found</p></div>}
            {displayedPlaces.map((place) => (
              <div key={place._id} onClick={() => setDetailPlace(place)} className="group rounded-xl cursor-pointer transition-all bg-white hover:bg-orange-50 border border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-md p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">{place.image ? <img src={place.image} alt={place.name} className="w-full h-full object-cover" /> : <Placeholder category={place.category} className="w-full h-full" />}</div>
                  <div className="flex-1 min-w-0"><p className="font-semibold text-gray-900 truncate group-hover:text-orange-600">{place.name}</p><div className="flex items-center space-x-2 mt-1.5"><div className="flex items-center text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-lg"><MapPin className="h-3.5 w-3.5 text-orange-500 mr-1" /><span>{place.distanceKm} km</span></div>{place.category && <span className="text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{place.category}</span>}</div></div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-500 self-center" />
                </div>
              </div>
            ))}
            {hasNextPage && !loadingPlaces && <button onClick={handleLoadMore} disabled={loadingMore} className="w-full py-3 bg-white hover:bg-gray-50 text-gray-600 font-medium rounded-xl border border-gray-200 shadow-sm flex items-center justify-center gap-2">{loadingMore ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</> : 'Load More'}</button>}
          </div>
        </div>
        <div className="flex-1 min-h-[500px] lg:min-h-0">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden h-full border border-gray-100">
            <div className="bg-gradient-to-r from-gray-900 to-black text-white p-5 flex items-center space-x-3 border-b border-gray-100"><div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm"><Navigation className="h-5 w-5 text-orange-400" /></div><div><span className="font-bold text-lg">Map View</span><p className="text-gray-400 text-xs">Explore services</p></div></div>
            <div className="h-[calc(100%-80px)] min-h-[450px] relative">
              <GoogleMap mapContainerStyle={containerStyle} center={selectedPlace?.currentLocation || userLocation || DEFAULT_CENTER} zoom={userLocation ? 12 : 5} options={{ ...mapOptions }}>
                {userLocation && <><Marker position={userLocation} icon={getUserMarkerIcon()} title="Your location" /><Circle center={userLocation} radius={DEFAULT_RADIUS} options={{ fillColor: '#f9731633', strokeColor: '#f97316', strokeOpacity: 0.8, strokeWeight: 2 }} /></>}
                {displayedPlaces.map((p) => <Marker key={p._id} position={{ lat: p.currentLocation?.lat, lng: p.currentLocation?.lng }} title={p.name} onClick={() => setSelectedPlace(p)} />)}
              </GoogleMap>
              {selectedPlace && userLocation && (
                <div className="absolute bottom-4 left-4 right-4 lg:right-auto lg:max-w-sm bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">{selectedPlace.image ? <img src={selectedPlace.image} alt={selectedPlace.name} className="w-full h-full object-cover" /> : <Placeholder category={selectedPlace.category} className="w-full h-full" />}</div>
                      <div><p className="font-bold text-gray-900">{selectedPlace.name}</p><p className="text-sm text-gray-500">{selectedPlace.distanceKm} km away</p></div>
                    </div>
                    <button onClick={() => setSelectedPlace(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="h-5 w-5" /></button>
                  </div>
                  <button onClick={() => setDetailPlace(selectedPlace)} className="w-full py-2 bg-orange-50 text-orange-600 font-medium rounded-lg border border-orange-100 hover:bg-orange-100">View Details</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmergencyServices;
