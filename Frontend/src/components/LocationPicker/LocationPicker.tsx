import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import styles from "./LocationPicker.module.scss"; 

// Fix Leaflet's default marker icon path issue in React/Webpack/Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
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

// Helper component to listen to click events on the map
const MapClickHandler: React.FC<{ onSelect: (lat: number, lng: number) => void }> = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Helper component to smoothly pan the map when coordinates change via the button
const MapUpdater: React.FC<{ center: L.LatLngExpression }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { animate: true, duration: 1 });
  }, [center, map]);
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLat = 27.7172, // Default: Kathmandu, Nepal
  initialLng = 85.324,
  onLocationSelect,
}) => {
  const [position, setPosition] = useState<L.LatLngExpression>([initialLat, initialLng]);
  const markerRef = useRef<L.Marker>(null);

  // Wrap in useCallback to safely include in useMemo dependencies
  const updatePosition = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  }, [onLocationSelect]);

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
    [updatePosition] // Now safely included!
  );

  // Trigger GPS geolocation
  const handleLocateMe = (e: React.MouseEvent) => {
    e.preventDefault();
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updatePosition(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          alert("Could not retrieve location. Please grant location permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
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
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" 
          />
          <MapClickHandler onSelect={updatePosition} />
          <MapUpdater center={position} />
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