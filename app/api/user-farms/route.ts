import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongoose";
import Farm from "../../../models/Farm";

async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = encodeURIComponent(`${address}, ${city}, ${state} ${zip}, USA`);
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=us`;
    const res = await fetch(url, { headers: { "User-Agent": "UFA-app/1.0" } });
    const json = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!json.length) return null;
    return { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    await dbConnect();
    const farms = await Farm.find({}).sort({ createdAt: -1 }).lean();

    // Retroactively geocode farms missing coordinates — sequential to respect
    // Nominatim's 1-request/second rate limit.
    const resolved: typeof farms = [];
    for (const farm of farms) {
      if (typeof farm.lat === "number" && typeof farm.lng === "number") {
        resolved.push(farm);
        continue;
      }
      const coords = await geocodeAddress(farm.address, farm.city, farm.state, farm.zip);
      if (!coords) {
        resolved.push(farm);
        continue;
      }
      // Persist so we don't re-geocode next time
      await Farm.updateOne({ _id: farm._id }, { $set: { lat: coords.lat, lng: coords.lng } });
      resolved.push({ ...farm, lat: coords.lat, lng: coords.lng });
      // Respect Nominatim rate limit between sequential requests
      await new Promise((r) => setTimeout(r, 1100));
    }

    const formattedFarms = resolved.map((farm) => ({
      _id: String(farm._id),
      MarketName: farm.name,
      Address: farm.address,
      City: farm.city,
      State: farm.state,
      Zip: farm.zip,
      Phone: farm.phone || "",
      Produces: Array.isArray(farm.produces) ? farm.produces : [],
      Description: farm.description,
      Lat: typeof farm.lat === "number" ? farm.lat : undefined,
      Lng: typeof farm.lng === "number" ? farm.lng : undefined,
    }));

    return NextResponse.json(formattedFarms);
  } catch (error) {
    console.error("Error fetching farms:", error);
    return NextResponse.json({ error: "Failed to fetch farms." }, { status: 500 });
  }
}