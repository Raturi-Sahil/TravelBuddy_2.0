import { GoogleMap, Marker } from '@react-google-maps/api';
import React from 'react';

import { useGoogleMaps } from '../context/GoogleMapsContext';

const containerStyle = {
  width: '100%',
  height: '500px'
};

function CurrentLocationMap({lat, lng}) {
  const currentPosition = { lat, lng };
  const { isLoaded } = useGoogleMaps();

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