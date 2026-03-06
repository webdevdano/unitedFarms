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

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const { name, address, city, state, zip, phone, produces, description } = data;
    if (!name || !address || !city || !state || !zip) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const coords = await geocodeAddress(address, city, state, zip);

    const farmData: Record<string, unknown> = {
      name,
      address,
      city,
      state,
      zip,
      produces: Array.isArray(produces) ? produces : [],
    };

    if (coords) {
      farmData.lat = coords.lat;
      farmData.lng = coords.lng;
    }

    if (phone && String(phone).trim()) farmData.phone = String(phone).trim();
    if (description && String(description).trim()) farmData.description = String(description).trim();

    const farm = await Farm.create(farmData);
    return NextResponse.json(farm, { status: 201 });
  } catch (error) {
    console.error("Error adding farm:", error);
    return NextResponse.json({ error: "Failed to add farm." }, { status: 500 });
  }
}