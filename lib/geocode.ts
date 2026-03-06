/**
 * Geocodes a US farm address via Nominatim (no API key required).
 * Tries the full street address first, then falls back to city+state+zip,
 * which succeeds for virtually any valid US location even if the exact
 * street is not in OSM.
 */
export async function geocodeFarm(
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<{ lat: number; lng: number } | null> {
  const queries = [
    `${address}, ${city}, ${state} ${zip}, USA`, // full address
    `${city}, ${state} ${zip}, USA`,              // city + zip fallback
    `${zip}, USA`,                                // zip-only last resort
  ];

  for (const q of queries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=us`;
      const res = await fetch(url, {
        headers: { "User-Agent": "UFA-app/1.0" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const json = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (json.length) {
        return { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) };
      }
    } catch {
      // timeout or network error — try next query
    }
  }

  return null;
}
