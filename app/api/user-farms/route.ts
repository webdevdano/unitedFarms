import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { dbConnect } from "../../../lib/mongoose";
import Farm from "../../../models/Farm";
import { geocodeFarm } from "../../../lib/geocode";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    await dbConnect();

    // If logged in, show only this user's farms; otherwise show all anonymous farms
    const query = session?.user?.id
      ? { createdBy: session.user.id }
      : { createdBy: null };

    const farms = await Farm.find(query).sort({ createdAt: -1 }).lean();

    // Retroactively geocode farms missing coordinates — sequential to respect
    // Nominatim's 1-request/second rate limit.
    const resolved: typeof farms = [];
    for (const farm of farms) {
      if (typeof farm.lat === "number" && typeof farm.lng === "number") {
        resolved.push(farm);
        continue;
      }
      const coords = await geocodeFarm(farm.address, farm.city, farm.state, farm.zip);
      if (!coords) {
        resolved.push(farm);
        continue;
      }
      // Persist so we don't re-geocode next time
      await Farm.updateOne({ _id: farm._id }, { $set: { lat: coords.lat, lng: coords.lng } });
      resolved.push({ ...farm, lat: coords.lat, lng: coords.lng });
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