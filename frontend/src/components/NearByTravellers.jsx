import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useUser } from "@clerk/clerk-react";

const containerStyle = {
  width: "100%",
  height: "calc(100vh - 80px)",
};

const libraries = ["places"]; // Kept consistent, though strictly not needed if only showing user marker

export default function NearByTravellers() {
  const [location, setLocation] = useState(null);
  const { user } = useUser();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API,
    libraries,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => console.warn("Location permission denied")
      );
    }
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="p-4 bg-gray-50 min-h-screen pt-4 pb-20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Nearby Travellers</h2>
        <p className="text-gray-600">See who is traveling around you.</p>
      </div>

      {location ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={location}
          zoom={14}
        >
          {/* User location */}
          <Marker
            position={location}
            title="You"
            icon={{
               url: user?.imageUrl,
               scaledSize: new window.google.maps.Size(40, 40),
               origin: new window.google.maps.Point(0, 0),
               anchor: new window.google.maps.Point(20, 20),
            }}
          />
          {/* In a real implementation, we would map over other users here */}
        </GoogleMap>
      ) : (
        <div>Getting your location...</div>
      )}
    </div>
  );
}
