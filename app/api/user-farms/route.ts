import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongoose";
import Farm from "../../../models/Farm";

export async function GET() {
  try {
    await dbConnect();
    const farms = await Farm.find({}).sort({ createdAt: -1 }).lean();
    // Map to match the expected format
    const formattedFarms = farms.map(farm => ({
      _id: farm._id.toString(),
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