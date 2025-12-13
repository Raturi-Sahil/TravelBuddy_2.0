import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const libraries = ["places"];

export default function MapView() {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);

  // Get user's current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => alert("Location permission denied")
    );
  }, []);

  // Fetch nearby places
  const fetchPlaces = (map) => {
    const service = new window.google.maps.places.PlacesService(map);

    const request = {
      location,
      radius: 3000, // 3 km
      type: ["tourist_attraction", "lodging"], // hotels + attractions
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setPlaces(results);
      }
    });
  };

  return (
    <LoadScript
      googleMapsApiKey="YOUR_API_KEY"
      libraries={libraries}
    >
      {location && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={location}
          zoom={14}
          onLoad={fetchPlaces}
        >
          {/* User location */}
          <Marker position={location} />

          {/* Nearby places */}
          {places.map((place) => (
            <Marker
              key={place.place_id}
              position={{
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              }}
            />
          ))}
        </GoogleMap>
      )}
    </LoadScript>
  );
}
