import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { dbConnect } from "../../../../lib/mongoose";
import Farm from "../../../../models/Farm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const farm = await Farm.findById(id);
    if (!farm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }
    return NextResponse.json({
      _id: farm._id.toString(),
      name: farm.name,
      address: farm.address,
      city: farm.city,
      state: farm.state,
      zip: farm.zip,
      phone: farm.phone,
    });
  } catch (error) {
    console.error("Error fetching farm:", error);
    return NextResponse.json({ error: "Failed to fetch farm." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { name, address, city, state, zip, phone } = body;

    if (!name || !address || !city || !state || !zip) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedFarm = await Farm.findByIdAndUpdate(
      id,
      { name, address, city, state, zip, phone },
      { new: true }
    );

    if (!updatedFarm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Farm updated successfully" });
  } catch (error) {
    console.error("Error updating farm:", error);
    return NextResponse.json({ error: "Failed to update farm." }, { status: 500 });
  }
}