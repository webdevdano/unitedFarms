import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { dbConnect } from "../../../lib/mongoose";
import Farm from "../../../models/Farm";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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