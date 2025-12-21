import { Circle, GoogleMap, Marker } from '@react-google-maps/api';
import { AlertCircle, ChevronRight, Clock, Filter, Loader2, MapPin, Navigation, Phone, Search, Shield, Star, Users, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { useGoogleMaps } from '../context/GoogleMapsContext';
import { placesService } from '../redux/services/api';

const containerStyle = { width: '100%', height: '100%' };
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_RADIUS = 20000;
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
];

function Placeholder({ category, className }) {
  const icons = { 'Hospital': '🏥', 'Pharmacy': '💊', 'Police': '👮', 'Fire Station': '🚒', 'ATM': '🏧', 'Bank': '🏦' };
  return <div className={`${className} bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center`}><span className="text-3xl">{icons[category] || '🆘'}</span></div>;
}

function DetailModal({ place, onClose }) {
  if (!place) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-zinc-800">
        <div className="relative h-64 bg-zinc-800">
          {place.image ? <img src={place.image} alt={place.name} className="w-full h-full object-cover" /> : <Placeholder category={place.category} className="w-full h-full" />}
          <button onClick={onClose} className="absolute top-3 right-3 bg-black/60 p-2 rounded-full text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">{place.name}</h2>
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-lg"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /><span className="font-bold text-yellow-500">{place.rating}</span></div>
            <div className="flex items-center gap-1.5 text-zinc-400"><MapPin className="w-4 h-4 text-red-500" /><span className="text-sm">{place.distanceKm} km</span></div>
            {place.category && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">{place.category}</span>}
          </div>
          {place.vicinity && <div className="mb-5"><h3 className="text-sm text-zinc-400 uppercase mb-2">Address</h3><p className="text-zinc-200">{place.vicinity}</p></div>}
          {place.phoneNumber && <div className="mb-5"><a href={`tel:${place.phoneNumber}`} className="flex items-center gap-2 text-red-400"><Phone className="w-4 h-4" />{place.phoneNumber}</a></div>}
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.currentLocation?.lat},${place.currentLocation?.lng}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl"><Navigation className="w-5 h-5" />Get Directions</a>
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
  const getUserMarkerIcon = () => window.google ? { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#ef4444', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 } : undefined;
  const displayedPlaces = isSearchMode ? searchResults : nearbyPlaces;
  const hasNextPage = isSearchMode ? searchNextToken : nearbyNextToken;

  if (!isLoaded || loadingLocation) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="h-16 w-16 animate-spin text-red-500" /></div>;

  return (
    <div className="min-h-screen bg-black pt-30">
      {detailPlace && <DetailModal place={detailPlace} onClose={() => setDetailPlace(null)} />}
      <div className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-20">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-2xl"><Shield className="h-7 w-7 text-white" /></div>
              <div><h1 className="text-2xl font-bold text-white">Emergency Services</h1><p className="text-sm text-zinc-400">{isSearchMode ? `${displayedPlaces.length} results` : `${displayedPlaces.length} nearby`}</p></div>
            </div>
            <button onClick={() => setShowList(!showList)} className="sm:hidden bg-red-600 text-white p-3 rounded-xl">{showList ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}</button>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <input type="text" placeholder="Search hospitals, pharmacies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="w-full pl-12 pr-10 py-3.5 bg-zinc-900 border-2 border-zinc-800 rounded-xl text-zinc-100" />
              {searchQuery && <button onClick={handleClearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"><X className="h-4 w-4" /></button>}
            </div>
            <button onClick={handleSearch} disabled={loadingPlaces} className="px-6 py-3.5 bg-red-600 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center gap-2">{loadingPlaces ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}<span className="hidden sm:inline">Search</span></button>
          </div>
          {error && <div className="mt-4 bg-red-950/50 border-l-4 border-red-500 rounded-xl p-4 text-red-400">{error}</div>}
        </div>
      </div>
      <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row gap-6 p-4 sm:p-6">
        <div className={`${showList ? 'block' : 'hidden'} lg:block lg:w-96 bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden`}>
          <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4"><h2 className="font-bold text-white">{isSearchMode ? '🔍 Search Results' : '📍 Nearby Services'}</h2></div>
          <div className="overflow-y-auto max-h-[calc(100vh-280px)] p-4 space-y-3">
            {loadingPlaces && <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" /></div>}
            {!loadingPlaces && displayedPlaces.length === 0 && <p className="text-center text-zinc-400 py-12">No services found</p>}
            {displayedPlaces.map((place) => (
              <div key={place._id} onClick={() => setDetailPlace(place)} className="group bg-zinc-800/50 hover:bg-zinc-800 rounded-xl p-4 cursor-pointer border-2 border-transparent hover:border-red-500/50">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-800">{place.image ? <img src={place.image} alt={place.name} className="w-full h-full object-cover" /> : <Placeholder category={place.category} className="w-full h-full" />}</div>
                  <div className="flex-1 min-w-0"><p className="font-semibold text-white truncate group-hover:text-red-400">{place.name}</p><div className="flex items-center space-x-2 mt-1"><span className="text-sm text-zinc-300">{place.distanceKm} km</span>{place.category && <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">{place.category}</span>}</div></div>
                  <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-red-500 self-center" />
                </div>
              </div>
            ))}
            {hasNextPage && !loadingPlaces && <button onClick={handleLoadMore} disabled={loadingMore} className="w-full py-3 bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-700">{loadingMore ? 'Loading...' : 'Load More'}</button>}
          </div>
        </div>
        <div className="flex-1 min-h-[500px]">
          <div className="bg-zinc-900/80 rounded-2xl h-full border border-zinc-800 overflow-hidden">
            <div className="bg-zinc-900 p-5 border-b border-zinc-800 flex items-center space-x-3"><Navigation className="h-5 w-5 text-red-400" /><span className="font-bold text-white">Map View</span></div>
            <div className="h-[calc(100%-80px)] min-h-[450px] relative">
              <GoogleMap mapContainerStyle={containerStyle} center={selectedPlace?.currentLocation || userLocation || DEFAULT_CENTER} zoom={userLocation ? 12 : 5} options={{ styles: darkMapStyles, streetViewControl: false, mapTypeControl: false }}>
                {userLocation && <><Marker position={userLocation} icon={getUserMarkerIcon()} /><Circle center={userLocation} radius={DEFAULT_RADIUS} options={{ fillColor: '#ef444433', strokeColor: '#ef4444' }} /></>}
                {displayedPlaces.map((p) => <Marker key={p._id} position={{ lat: p.currentLocation?.lat, lng: p.currentLocation?.lng }} onClick={() => setSelectedPlace(p)} />)}
              </GoogleMap>
              {selectedPlace && (
                <div className="absolute bottom-4 left-4 right-4 lg:max-w-sm bg-zinc-900/95 rounded-2xl border border-zinc-800 p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-800">{selectedPlace.image ? <img src={selectedPlace.image} className="w-full h-full object-cover" /> : <Placeholder category={selectedPlace.category} className="w-full h-full" />}</div>
                    <div><p className="font-bold text-white">{selectedPlace.name}</p><p className="text-sm text-zinc-400">{selectedPlace.distanceKm} km</p></div>
                    <button onClick={() => setSelectedPlace(null)} className="ml-auto text-zinc-500"><X className="h-5 w-5" /></button>
                  </div>
                  <button onClick={() => setDetailPlace(selectedPlace)} className="w-full py-2 bg-red-600/20 text-red-400 rounded-lg border border-red-500/30">View Details</button>
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
