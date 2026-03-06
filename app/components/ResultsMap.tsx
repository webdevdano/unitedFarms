"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { registerMapFocus } from "../../lib/mapBridge";

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

function makeDefaultIcon() {
  return L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

function makeSelectedIcon() {
  return L.divIcon({
    className: "",
    html: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 40' width='28' height='40'><path d='M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26S28 24.5 28 14C28 6.27 21.73 0 14 0z' fill='#16a34a' stroke='#fff' stroke-width='2'/><circle cx='14' cy='14' r='6' fill='#fff'/></svg>",
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -40],
  });
}

export default function ResultsMap({
  markers,
  fallbackCenter = { lat: 39.8283, lng: -98.5795 },
  className,
}: ResultsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const popupRef = useRef<L.Popup | null>(null);

  // ── init map once ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [fallbackCenter.lat, fallbackCenter.lng],
      zoom: 4,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
      maxZoom: 19,
    }).addTo(map);

    popupRef.current = L.popup({ offset: [0, -38] });
    mapRef.current = map;

    // Register via window so the reference survives Turbopack chunk splits.
    registerMapFocus((lat, lng, title) => {
      console.log("[ResultsMap] focusFn called", lat, lng);
      const m = mapRef.current;
      const popup = popupRef.current;
      if (!m) { console.warn("[ResultsMap] map not ready"); return; }

      m.invalidateSize();

      markersRef.current.forEach((marker) => {
        const pos = marker.getLatLng();
        const hit = Math.abs(pos.lat - lat) < 0.00001 && Math.abs(pos.lng - lng) < 0.00001;
        marker.setIcon(hit ? makeSelectedIcon() : makeDefaultIcon());
      });

      m.setView([lat, lng], 14, { animate: true });

      setTimeout(() => {
        if (!mapRef.current || !popup) return;
        popup
          .setLatLng([lat, lng])
          .setContent("<span style=\"font-weight:600;color:#166534\">" + (title ?? "Farm") + "</span>")
          .openOn(mapRef.current);
      }, 350);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
      popupRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── sync markers when results change ─────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (markers.length === 0) {
      map.setView([fallbackCenter.lat, fallbackCenter.lng], 4, { animate: true });
      return;
    }

    const defaultIcon = makeDefaultIcon();
    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], { icon: defaultIcon });
      if (m.title) {
        marker.bindPopup("<span style=\"font-weight:600;color:#166534\">" + m.title + "</span>");
      }
      marker.addTo(map);
      markersRef.current.push(marker);
    });

    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 12, { animate: true });
    } else {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13, animate: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  return (
    <div
      ref={containerRef}
      className={"w-full h-full rounded-xl overflow-hidden shadow-md ring-1 ring-gray-200" + (className ? " " + className : "")}
    />
  );
}
