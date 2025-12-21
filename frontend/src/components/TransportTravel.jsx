import { Circle,GoogleMap, Marker } from '@react-google-maps/api';
import {
  AlertCircle,
  ChevronRight,
  Clock,
  Filter,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Plane,
  Radio,
  Search,
  Sliders,
  Star,
  Users,
  X} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useGoogleMaps } from '../context/GoogleMapsContext';
import { placesService } from '../redux/services/api';

const containerStyle = { width: '100%', height: '100%' };
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_RADIUS_KM = 20;
const MIN_RADIUS_KM = 5;
const MAX_RADIUS_KM = 100;

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
];

function PlaceDetailModal({ place, onClose }) {
  if (!place) return null;

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Airport': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'Train Station': return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'Bus Station': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'Metro': return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      case 'Car Rental': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Gas Station': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-zinc-800 shadow-2xl animate-scale-in">
        <div className="relative">
          <div className="relative h-64 bg-zinc-800">
            <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 p-2 rounded-full text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          <h2 className="text-2xl font-bold text-white mb-4">{place.name}</h2>

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
              <MapPin className="w-4 h-4 text-teal-500" />
              <span className="text-sm">{place.distanceKm} km away</span>
            </div>
            {place.category && (
              <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(place.category)}`}>{place.category}</span>
            )}
          </div>

          {place.vicinity && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase mb-2">Address</h3>
              <p className="text-zinc-200">{place.vicinity}</p>
            </div>
          )}

          {place.phoneNumber && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase mb-2">Contact</h3>
              <a href={`tel:${place.phoneNumber}`} className="flex items-center gap-2 text-teal-400">
                <Phone className="w-4 h-4" /><span>{place.phoneNumber}</span>
              </a>
            </div>
          )}

          {place.isOpen !== undefined && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase mb-2">Status</h3>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className={place.isOpen ? 'text-green-400' : 'text-red-400'}>{place.isOpen ? 'Open Now' : 'Closed'}</span>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-zinc-800">
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.currentLocation?.lat},${place.currentLocation?.lng}`} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold py-3 px-6 rounded-xl">
              <Navigation className="w-5 h-5" />Get Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransportTravel() {
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
      const response = await placesService.getNearbyTransport(lat, lng, radius);
      if (response.statusCode === 200) setNearbyPlaces(response.data || []);
      else setError(response.message || 'Failed to fetch');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch transport options.');
    } finally {
      setLoadingPlaces(false);
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) { setError('Geolocation not supported.'); setLoadingLocation(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setUserLocation(c); setLoadingLocation(false); fetchNearbyPlaces(c.lat, c.lng, radiusKm * 1000); },
      () => { setUserLocation(DEFAULT_CENTER); setLoadingLocation(false); fetchNearbyPlaces(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, radiusKm * 1000); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchNearbyPlaces]);

  const filteredPlaces = useMemo(() => nearbyPlaces.filter((p) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())), [nearbyPlaces, searchQuery]);

  const handleSearch = () => {
    if (userLocation) fetchNearbyPlaces(userLocation.lat, userLocation.lng, radiusMeters);
  };

  const getUserMarkerIcon = () => window.google ? { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#14b8a6', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 } : undefined;

  if (!isLoaded || loadingLocation) {
    return (<div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="h-16 w-16 animate-spin text-teal-500" /></div>);
  }

  return (
    <div className="min-h-screen bg-black pt-30">
      {detailPlace && <PlaceDetailModal place={detailPlace} onClose={() => setDetailPlace(null)} />}

      <div className="bg-zinc-900/80 backdrop-blur-xl shadow-2xl border-b border-zinc-800 sticky top-0 z-20">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-4">
              <div className="relative bg-gradient-to-br from-teal-600 to-teal-700 p-3 rounded-2xl shadow-lg">
                <Plane className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Transport & Travel</h1>
                <p className="text-sm text-zinc-400">{filteredPlaces.length} nearby • Within {radiusKm} km</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRadiusInput(!showRadiusInput)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium ${showRadiusInput ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
              >
                <Sliders className="h-4 w-4" />
                <span className="hidden sm:inline">{radiusKm} km</span>
              </button>
              <button onClick={() => setShowList(!showList)} className="sm:hidden bg-teal-600 text-white p-3 rounded-xl">
                {showList ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {showRadiusInput && (
            <div className="mb-5 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
              <div className="flex justify-between mb-3">
                <span className="text-sm text-zinc-300">Search Radius</span>
                <span className="text-lg font-bold text-purple-400">{radiusKm} km</span>
              </div>
              <input type="range" min={MIN_RADIUS_KM} max={MAX_RADIUS_KM} value={radiusKm} onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
              <div className="flex justify-between text-xs text-zinc-500 mt-2"><span>{MIN_RADIUS_KM} km</span><span>{MAX_RADIUS_KM} km</span></div>
            </div>
          )}

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <input type="text" placeholder="Search airports, stations, rentals..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3.5 bg-zinc-900 border-2 border-zinc-800 rounded-xl focus:ring-2 focus:ring-teal-500 text-zinc-100" />
            </div>
            <button onClick={handleSearch} disabled={loadingPlaces} className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center gap-2">
              {loadingPlaces ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          {error && <div className="mt-4 bg-red-950/50 border-l-4 border-red-500 rounded-xl p-4 text-red-400">{error}</div>}
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row gap-6 p-4 sm:p-6">
        <div className={`${showList ? 'block' : 'hidden'} lg:block lg:w-96 bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden`}>
          <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4"><h2 className="font-bold text-white">Transport Options</h2></div>
          <div className="overflow-y-auto max-h-[calc(100vh-280px)] p-4 space-y-3">
            {loadingPlaces && <Loader2 className="w-8 h-8 animate-spin text-teal-500 mx-auto" />}
            {!loadingPlaces && filteredPlaces.length === 0 && <p className="text-center text-zinc-400">No places found</p>}
            {filteredPlaces.map((place) => (
              <div key={place._id} onClick={() => setDetailPlace(place)} className="group bg-zinc-800/50 hover:bg-zinc-800 rounded-xl p-4 cursor-pointer border-2 border-transparent hover:border-teal-500/50">
                <div className="flex items-start space-x-4">
                  <img src={place.image} alt={place.name} className="w-20 h-20 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-white group-hover:text-teal-400">{place.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-zinc-300">{place.distanceKm} km</span>
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-yellow-500">{place.rating}</span>
                    </div>
                    {place.category && <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded mt-1 inline-block">{place.category}</span>}
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-teal-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-[500px]">
          <div className="bg-zinc-900/80 rounded-2xl h-full border border-zinc-800 overflow-hidden">
            <div className="bg-zinc-900 p-5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Navigation className="h-5 w-5 text-teal-400" />
                <span className="font-bold text-white">Map View</span>
              </div>
              <span className="text-sm text-zinc-400">{radiusKm} km radius</span>
            </div>
            <div className="h-[calc(100%-80px)] min-h-[450px] relative">
              <GoogleMap mapContainerStyle={containerStyle} center={selectedPlace?.currentLocation || userLocation || DEFAULT_CENTER} zoom={userLocation ? 11 : 5} options={{ styles: darkMapStyles, streetViewControl: false, mapTypeControl: false }}>
                {userLocation && (<><Marker position={userLocation} icon={getUserMarkerIcon()} /><Circle center={userLocation} radius={radiusMeters} options={{ fillColor: '#14b8a633', strokeColor: '#14b8a6' }} /></>)}
                {filteredPlaces.map((p) => (<Marker key={p._id} position={{ lat: p.currentLocation?.lat, lng: p.currentLocation?.lng }} onClick={() => setSelectedPlace(p)} />))}
              </GoogleMap>
              {selectedPlace && (
                <div className="absolute bottom-4 left-4 right-4 lg:max-w-sm bg-zinc-900/95 rounded-2xl border border-zinc-800 p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <img src={selectedPlace.image} className="w-16 h-16 rounded-lg object-cover" />
                    <div><p className="font-bold text-white">{selectedPlace.name}</p><p className="text-sm text-zinc-400">{selectedPlace.distanceKm} km</p></div>
                    <button onClick={() => setSelectedPlace(null)} className="ml-auto text-zinc-500"><X className="h-5 w-5" /></button>
                  </div>
                  <button onClick={() => setDetailPlace(selectedPlace)} className="w-full py-2 bg-teal-600/20 text-teal-400 rounded-lg border border-teal-500/30">View Details</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`.animate-fade-in { animation: fade-in 0.2s; } .animate-scale-in { animation: scale-in 0.2s; } @keyframes fade-in { from { opacity: 0; } } @keyframes scale-in { from { transform: scale(0.95); } }`}</style>
    </div>
  );
}

export default TransportTravel;
