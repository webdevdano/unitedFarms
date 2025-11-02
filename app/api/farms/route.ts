import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongoose";
import Farm from "../../../models/Farm";

// Local DB-backed search since the external USDA API is unreliable.
// Supports queries by either:
// - zip (exact match). Radius parameter is currently ignored.
// - city + state (case-insensitive match on both).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zip = (searchParams.get("zip") || "").trim();
  const city = (searchParams.get("city") || "").trim();
  const state = (searchParams.get("state") || "").trim();
  const radius = Number(searchParams.get("radius") || "30"); // miles

  if (!zip && !(city && state)) {
    return NextResponse.json(
      { error: "Please provide a zip code or 'City' and 'State'." },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

  const query: Partial<{ zip: string; city: unknown; state: unknown }> = {};
    if (zip) {
      // Exact zip match
      query.zip = zip;
    } else {
      // Case-insensitive match for city and state
      query.city = { $regex: new RegExp(`^${escapeRegex(city)}$`, "i") };
      query.state = { $regex: new RegExp(`^${escapeRegex(state)}$`, "i") };
    }

    const farms = await Farm.find(query).sort({ createdAt: -1 }).limit(200);

    const dbFormatted = farms.map((farm) => ({
      _id: farm._id.toString(),
      MarketName: farm.name,
      Address: farm.address,
      City: farm.city,
      Zip: farm.zip,
      Phone: farm.phone || "",
      FarmType: farm.farmType,
      Description: farm.description,
    }));

    // Optionally augment with Google Places results if API key is present
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    type UiFarm = {
      _id?: string;
      MarketName: string;
      Address: string;
      City: string;
      Zip: string;
      Phone?: string;
      FarmType?: string;
      Description?: string;
      Lat?: number;
      Lng?: number;
    };
    let placesFormatted: UiFarm[] = [];

    if (apiKey) {
      try {
        const location = zip
          ? await geocodeZip(zip, apiKey)
          : await geocodeCityState(city, state, apiKey);

        if (location) {
          const meters = Math.max(1609, Math.min(50000, Math.round(radius * 1609.34))); // clamp 1mi..~31mi
          const text = encodeURIComponent("farm OR farmers market");
          const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${text}&location=${location.lat},${location.lng}&radius=${meters}&key=${apiKey}`;
          const res = await fetch(url, { cache: "no-store" });
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json.results)) {
              type PlaceResult = {
                name: string;
                formatted_address: string;
                types?: string[];
                business_status?: string;
                geometry?: { location?: { lat: number; lng: number } };
              };
              placesFormatted = (json.results as PlaceResult[]).map((p) => {
                const addr = p.formatted_address as string;
                const { city: c, zip: z } = parseCityZip(addr);
                const lat = p.geometry?.location?.lat;
                const lng = p.geometry?.location?.lng;
                return {
                  MarketName: p.name,
                  Address: addr,
                  City: c || city,
                  Zip: z || zip,
                  Phone: "", // Details API needed for phone
                  FarmType: "Other",
                  Description: (p.types || []).join(", ") || p.business_status || "",
                  Lat: typeof lat === 'number' ? lat : undefined,
                  Lng: typeof lng === 'number' ? lng : undefined,
                };
              });
            }
          } else {
            console.warn("Google Places fetch failed:", res.status);
          }
        }
      } catch (e) {
        console.warn("Google Places integration error:", e);
      }
    }

    // Merge DB and Places results, de-duplicate by MarketName+Zip
    const merged: UiFarm[] = [];
    const seen = new Set<string>();
    const pushUnique = (item: UiFarm) => {
      const key = `${(item.MarketName || "").toLowerCase()}|${item.Zip || ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    };
    dbFormatted.forEach(pushUnique);
    placesFormatted.forEach(pushUnique);

    return NextResponse.json(merged);
  } catch (error) {
    console.error("Error searching farms:", error);
    return NextResponse.json({ error: "Failed to fetch farm data." }, { status: 500 });
  }
}

// Simple regex escaper for building safe regex from user text
function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function geocodeZip(zip: string, apiKey: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(zip)}&components=country:US|postal_code:${encodeURIComponent(zip)}&key=${apiKey}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  const loc = json?.results?.[0]?.geometry?.location;
  return loc ? { lat: loc.lat, lng: loc.lng } : null;
}

async function geocodeCityState(city: string, state: string, apiKey: string): Promise<{ lat: number; lng: number } | null> {
  const q = `${city}, ${state}, USA`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${apiKey}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  const loc = json?.results?.[0]?.geometry?.location;
  return loc ? { lat: loc.lat, lng: loc.lng } : null;
}

function parseCityZip(formattedAddress: string): { city?: string; zip?: string } {
  // Example formats: "123 Main St, Chico, CA 95928, USA"
  const parts = formattedAddress.split(",").map((s) => s.trim());
  if (parts.length >= 3) {
    const city = parts[parts.length - 3];
    const stateZip = parts[parts.length - 2];
    const zipMatch = stateZip.match(/\b(\d{5})(?:-\d{4})?\b/);
    return { city, zip: zipMatch ? zipMatch[1] : undefined };
  }
  const zipMatch = formattedAddress.match(/\b(\d{5})(?:-\d{4})?\b/);
  return { zip: zipMatch ? zipMatch[1] : undefined };
}