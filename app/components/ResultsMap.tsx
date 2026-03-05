"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";

// Fix broken default marker icons when bundled with webpack/Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export type MapMarker = {
  lat: number;
  lng: number;
  title?: string;
};

type ResultsMapProps = {
  markers: MapMarker[];
  fallbackCenter?: { lat: number; lng: number };
  className?: string;
};

/** Flies to fit all markers whenever they change */
function FitBounds({ markers, fallbackCenter }: { markers: MapMarker[]; fallbackCenter: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) {
      map.setView(fallbackCenter, 4, { animate: true });
      return;
    }
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 12, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13, animate: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  return null;
}

export default function ResultsMap({
  markers,
  fallbackCenter = { lat: 39.8283, lng: -98.5795 },
  className,
}: ResultsMapProps) {
  const center = useMemo((): [number, number] => {
    if (markers.length > 0) return [markers[0].lat, markers[0].lng];
    return [fallbackCenter.lat, fallbackCenter.lng];
  }, [markers, fallbackCenter]);

  const fb: [number, number] = [fallbackCenter.lat, fallbackCenter.lng];

  return (
    <div className={`w-full h-full rounded-xl overflow-hidden shadow-md ring-1 ring-gray-200 ${className ?? ""}`}>
      <MapContainer
        center={center}
        zoom={markers.length > 0 ? 11 : 4}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <FitBounds markers={markers} fallbackCenter={fb} />
        {markers.map((m, idx) => (
          <Marker key={`${m.lat}-${m.lng}-${idx}`} position={[m.lat, m.lng]}>
            {m.title && (
              <Popup>
                <span className="font-medium text-green-800">{m.title}</span>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
