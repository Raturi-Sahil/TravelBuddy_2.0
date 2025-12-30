import { useEffect,useState } from 'react';

import { useSocketContext } from '../context/socketContext';
import ReverseGeocode from '../helpers/reverseGeoCode';

const useLocationTracking = (isSignedIn) => {
  const { socket } = useSocketContext();
  const [currentLocationName, setCurrentLocationName] = useState('Locating...');

  useEffect(() => {
    if (!isSignedIn) return;

    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

             // 1. Get readable address for UI
            try {
               const address = await ReverseGeocode({ lat: latitude, lng: longitude });
               // console.log('address', address);
               setCurrentLocationName(address);
            } catch (error) {
               console.error("Reverse geocode error:", error);
               setCurrentLocationName("Unknown Location");
            }

            // 2. Emit location to backend via socket
            if (socket) {
              socket.emit("updateLocation", { lat: latitude, lng: longitude });
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            setCurrentLocationName("Location Unavailable");
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );
      } else {
        setCurrentLocationName("Geolocation not supported");
      }
    };

    // Initial update
    updateLocation();

    // Update every 1 minute
    const intervalId = setInterval(updateLocation, 60000);

    return () => clearInterval(intervalId);
  }, [isSignedIn, socket]);

  return { currentLocationName };
};

export default useLocationTracking;
