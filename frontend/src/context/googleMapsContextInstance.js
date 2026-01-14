import { createContext } from 'react';

export const GoogleMapsContext = createContext({
  isLoaded: false,
  loadError: null,
});
