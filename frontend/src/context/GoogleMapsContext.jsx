import { useJsApiLoader } from '@react-google-maps/api';

import { GoogleMapsContext } from './googleMapsContextInstance';

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
