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

// Highlighted (selected) marker: bright green pin rendered as a div icon
const selectedIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:28px;height:40px;position:relative;
  "><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 40' width='28' height='40'>
    <path d='M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.27 21.73 0 14 0z'
      fill='#16a34a' stroke='#fff' stroke-width='2'/>
    <circle cx='14' cy='14' r='6' fill='#fff'/>
  </svg></div>`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -40],
});

export type MapMarker = {
  lat: number;
  lng: number;
  title?: string;
  /** Increment to re-trigger focus even when lat/lng haven't changed */
  seq?: number;
};

type ResultsMapProps = {
  markers: MapMarker[];
  fallbackCenter?: { lat: number; lng: number };
  className?: string;
  focusMarker?: MapMarker | null;
};

/** Fits map to all markers whenever they change */
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

/** Pans/zooms to the focused marker and opens a popup directly via the Leaflet API.
 *  Using L.popup().openOn(map) bypasses react-leaflet ref forwarding entirely,
 *  which is unreliable in v5. focusMarker is always a new object (seq increments)
 *  so the effect reliably re-fires on every card click. */
function FocusMap({
  focusMarker,
}: {
  focusMarker: MapMarker | null | undefined;
}) {
  const map = useMap();

  useEffect(() => {
    if (!focusMarker) return;

    map.setView([focusMarker.lat, focusMarker.lng], 14, { animate: true });

    const timer = setTimeout(() => {
      L.popup({ offset: [0, -38] })
        .setLatLng([focusMarker.lat, focusMarker.lng])
        .setContent(
          `<span style="font-weight:600;color:#166534">${focusMarker.title ?? "Farm"}</span>`
        )
        .openOn(map);
    }, 350);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMarker]);

  return null;
}

export default function ResultsMap({
  markers,
  fallbackCenter = { lat: 39.8283, lng: -98.5795 },
  className,
  focusMarker,
}: ResultsMapProps) {
  const center = useMemo((): [number, number] => {
    if (markers.length > 0) return [markers[0].lat, markers[0].lng];
    return [fallbackCenter.lat, fallbackCenter.lng];
  }, [markers, fallbackCenter]);

  const fb: [number, number] = [fallbackCenter.lat, fallbackCenter.lng];

  const focusKey = focusMarker ? `${focusMarker.lat}-${focusMarker.lng}` : null;

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
        <FocusMap focusMarker={focusMarker} />
        {markers.map((m, idx) => {
          const key = `${m.lat}-${m.lng}`;
          const isSelected = key === focusKey;
          return (
            <Marker
              key={`${key}-${idx}`}
              position={[m.lat, m.lng]}
              icon={isSelected ? selectedIcon : undefined}
            >
              {m.title && (
                <Popup>
                  <span className="font-medium text-green-800">{m.title}</span>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
