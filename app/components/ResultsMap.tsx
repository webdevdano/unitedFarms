"use client";
import { GoogleMap, LoadScript, MarkerF } from "@react-google-maps/api";
import { useMemo } from "react";

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

export default function ResultsMap({ markers, fallbackCenter = { lat: 39.8283, lng: -98.5795 }, className }: ResultsMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string | undefined;

  // Compute center: first marker, else fallback (rough center of US)
  const center = useMemo(() => {
    if (markers.length > 0) {
      return { lat: markers[0].lat, lng: markers[0].lng };
    }
    return fallbackCenter;
  }, [markers, fallbackCenter]);

  const containerStyle: React.CSSProperties = { width: "100%", height: "100%", borderRadius: 8 };

  // Don't render map if no API key present
  if (!apiKey) {
    return (
      <div className={`w-full h-full bg-gray-100 text-gray-600 flex items-center justify-center rounded ${className || ""}`}>
        Google Maps not configured
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={[]}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={markers.length ? 11 : 4} options={{ streetViewControl: false, mapTypeControl: false }}>
        {markers.map((m, idx) => (
          <MarkerF key={`${m.lat}-${m.lng}-${idx}`} position={{ lat: m.lat, lng: m.lng }} title={m.title} />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}
