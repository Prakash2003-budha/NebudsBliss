import React, { useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Correctly import CSS module styles
import styles from "./LocationPicker.module.scss"; 

// Fix Leaflet's default marker icon path issue in React/Webpack/Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Define a temporary type that includes the missing property
interface DefaultIcon extends L.Icon.Default {
  _getIconUrl?: string;
}

// Cast to our new type instead of 'any'
delete (L.Icon.Default.prototype as DefaultIcon)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

// Inner helper component to listen to click events on the map
const MapClickHandler: React.FC<{ onSelect: (lat: number, lng: number) => void }> = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLat = 27.7172, // Default: Kathmandu, Nepal
  initialLng = 85.324,
  onLocationSelect,
}) => {
  const [position, setPosition] = useState<L.LatLngExpression>([initialLat, initialLng]);
  const markerRef = useRef<L.Marker>(null);

  const updatePosition = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  // Handler for when user finishes dragging the pin
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          updatePosition(lat, lng);
        }
      },
    }),
    []
  );

  // Trigger GPS geolocation
  const handleLocateMe = (e: React.MouseEvent) => {
    e.preventDefault();
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updatePosition(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          alert("Could not retrieve location. Please grant location permissions.");
        }
      );
    }
  };

  return (
    <div className={styles.locationPickerContainer}>
      <div className={styles.mapWrapper}>
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={false}
          className={styles.mapContainer}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onSelect={updatePosition} />
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
          />
        </MapContainer>
      </div>

      <button
        type="button"
        onClick={handleLocateMe}
        className={styles.locateBtn}
      >
        📍 Use Current Location
      </button>
    </div>
  );
};