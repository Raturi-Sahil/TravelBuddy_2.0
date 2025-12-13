import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "calc(100vh - 80px)", // Full height minus navbar roughly
};

const libraries = ["places"];

export default function NearHotels() {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [mapInstance, setMapInstance] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API,
    libraries,
  });

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => console.warn("Location permission denied or unavailable")
      );
    }
  }, []);

  // Fetch nearby places when map is loaded and location is available
  useEffect(() => {
    if (isLoaded && mapInstance && location) {
      const service = new window.google.maps.places.PlacesService(mapInstance);

      const request = {
        location,
        radius: 3000, // 3 km
        type: ["lodging"],
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setPlaces(results);
        }
      });
    }
  }, [isLoaded, mapInstance, location]);

  const onLoad = (map) => {
    setMapInstance(map);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="p-4 bg-gray-50 min-h-screen pt-4 pb-20">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Nearby Hotels</h2>
      {location ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={location}
          zoom={14}
          onLoad={onLoad}
        >
          {/* User location */}
          <Marker position={location} title="You are here" />

          {/* Nearby places */}
          {places.map((place) => (
            <Marker
              key={place.place_id}
              position={{
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              }}
              title={place.name}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Different color for places
              }}
            />
          ))}
        </GoogleMap>
      ) : (
        <div>Getting your location...</div>
      )}
    </div>
  );
}
