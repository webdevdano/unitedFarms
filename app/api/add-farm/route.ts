import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { dbConnect } from "../../../lib/mongoose";
import Farm from "../../../models/Farm";
import { geocodeFarm } from "../../../lib/geocode";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    await dbConnect();
    const data = await request.json();
    const { name, address, city, state, zip, phone, produces, description } = data;
    if (!name || !address || !city || !state || !zip) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const coords = await geocodeFarm(address, city, state, zip);

    const farmData: Record<string, unknown> = {
      name,
      address,
      city,
      state,
      zip,
      produces: Array.isArray(produces) ? produces : [],
      createdBy: session?.user?.id ?? null,
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