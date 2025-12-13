import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import React, { useEffect,useState } from 'react';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const libraries = ['places'];

function CurrentLocationMap({lat, lng}) {
const currentPosition = { lat, lng };
  const [error, setError] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey:import.meta.env.VITE_GOOGLE_API,
    libraries
  });



  if (!isLoaded) return <div>Loading map...</div>;

  if (!lat || !lng) return <div>Getting your location...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={currentPosition}
      zoom={15}
    >
      <Marker position={currentPosition} />
    </GoogleMap>
  );
}

export default CurrentLocationMap;