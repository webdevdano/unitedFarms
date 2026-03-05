import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/mongoose";
import Farm from "../../../../models/Farm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

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
      produces: Array.isArray(farm.produces) ? farm.produces : [],
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { name, address, city, state, zip, phone, produces, description } = body;

    if (!name || !address || !city || !state || !zip) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if the farm exists
    const existingFarm = await Farm.findById(id);
    if (!existingFarm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      name,
      address,
      city,
      state,
      zip,
      produces: Array.isArray(produces) ? produces : [],
    };

    if (phone && String(phone).trim()) updateData.phone = String(phone).trim();
    if (description && String(description).trim()) updateData.description = String(description).trim();

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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const existingFarm = await Farm.findById(id);
    if (!existingFarm) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    await Farm.findByIdAndDelete(id);
    return NextResponse.json({ message: "Farm deleted successfully" });
  } catch (error) {
    console.error("Error deleting farm:", error);
    return NextResponse.json({ error: "Failed to delete farm." }, { status: 500 });
  }
}