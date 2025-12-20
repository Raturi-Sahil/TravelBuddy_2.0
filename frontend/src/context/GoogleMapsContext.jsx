import { useJsApiLoader } from '@react-google-maps/api';
import React, { createContext, useContext } from 'react';

const GoogleMapsContext = createContext({
  isLoaded: false,
  loadError: null,
});

// Define libraries array outside component to prevent re-renders
const libraries = ['places'];

export function GoogleMapsProvider({ children }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API,
    libraries,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
}
