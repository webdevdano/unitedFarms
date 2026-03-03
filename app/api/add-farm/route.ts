import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/mongoose";
import Farm from "../../../models/Farm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();
    const { name, address, city, state, zip, phone, farmType, description } = data;
    if (!name || !address || !city || !state || !zip || !farmType) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    // Create farm data object, only including non-empty optional fields
    const farmData: { [key: string]: string } = {
      name,
      address,
      city,
      state,
      zip,
      farmType,
    };

    if (phone && phone.trim()) farmData.phone = phone.trim();
    if (description && description.trim()) farmData.description = description.trim();

    const farm = await Farm.create(farmData);
    return NextResponse.json(farm, { status: 201 });
  } catch (error) {
    console.error("Error adding farm:", error);
    return NextResponse.json({ error: "Failed to add farm." }, { status: 500 });
  }
}