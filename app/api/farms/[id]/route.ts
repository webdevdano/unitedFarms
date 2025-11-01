import { NextResponse } from "next/server";
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
      farmType: farm.farmType,
      description: farm.description,
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
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { name, address, city, state, zip, phone, farmType, description } = body;

    if (!name || !address || !city || !state || !zip || !farmType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if the farm exists
    const existingFarm = await Farm.findById(id);
    if (!existingFarm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    // Create update data object, only including non-empty optional fields
    const updateData: { [key: string]: string } = {
      name,
      address,
      city,
      state,
      zip,
      farmType,
    };

    if (phone && phone.trim()) updateData.phone = phone.trim();
    if (description && description.trim()) updateData.description = description.trim();

    // Update the farm
    await Farm.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return NextResponse.json({ message: "Farm updated successfully" });
  } catch (error) {
    console.error("Error updating farm:", error);
    return NextResponse.json({ error: "Failed to update farm." }, { status: 500 });
  }
}