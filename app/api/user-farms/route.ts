import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongoose";
import Farm from "../../../models/Farm";

export async function GET() {
  try {
    await dbConnect();
    const farms = await Farm.find({}).sort({ createdAt: -1 });
    // Map to match the expected format
    const formattedFarms = farms.map(farm => ({
      _id: farm._id.toString(),
      MarketName: farm.name,
      Address: farm.address,
      City: farm.city,
      Zip: farm.zip,
      Phone: farm.phone || "",
    }));
    return NextResponse.json(formattedFarms);
  } catch (error) {
    console.error("Error fetching user farms:", error);
    return NextResponse.json({ error: "Failed to fetch user farms." }, { status: 500 });
  }
}