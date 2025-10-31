import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Farm from "@/models/Farm";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const { name, address, city, state, zip, phone } = data;
    if (!name || !address || !city || !state || !zip) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    const farm = await Farm.create({
      name,
      address,
      city,
      state,
      zip,
      phone,
    });
    return NextResponse.json(farm, { status: 201 });
  } catch (error) {
    console.error("Error adding farm:", error);
    return NextResponse.json({ error: "Failed to add farm." }, { status: 500 });
  }
}