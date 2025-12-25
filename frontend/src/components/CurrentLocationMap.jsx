import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '../context/GoogleMapsContext';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem'
};

function CurrentLocationMap({ lat, lng, zoom = 15 }) {
  const { isLoaded } = useGoogleMaps();

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-xl">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  if (!lat || !lng) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-xl">
        <p className="text-gray-500">Location not available</p>
      </div>
    );
  }

  const center = { lat: Number(lat), lng: Number(lng) };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      }}
    >
      <Marker position={center} />
    </GoogleMap>
  );
}

export default CurrentLocationMap;
