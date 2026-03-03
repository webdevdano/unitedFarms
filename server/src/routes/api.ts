import { Router } from "express";
import Farm from "../models/Farm";
import { dbConnect } from "../db";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

type FarmDoc = {
  _id: { toString(): string };
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  farmType: string;
  description?: string;
};

// GET /api/user-farms
router.get("/user-farms", async (_req, res) => {
  try {
    await dbConnect();
    const farms = (await Farm.find({}).sort({ createdAt: -1 })) as unknown as FarmDoc[];
    const formatted = farms.map((farm) => ({
      _id: farm._id.toString(),
      MarketName: farm.name,
      Address: farm.address,
      City: farm.city,
      Zip: farm.zip,
      Phone: farm.phone || "",
      FarmType: farm.farmType,
      Description: farm.description,
    }));
    res.json(formatted);
  } catch (e) {
    console.error("Error fetching user farms:", e);
    res.status(500).json({ error: "Failed to fetch farms." });
  }
});

// POST /api/add-farm (auth required)
router.post("/add-farm", requireAuth, async (req, res) => {
  try {
    await dbConnect();
    const { name, address, city, state, zip, phone, farmType, description } = req.body || {};
    if (!name || !address || !city || !state || !zip || !farmType) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const farmData: Record<string, string> = { name, address, city, state, zip, farmType };
    if (phone && String(phone).trim()) farmData.phone = String(phone).trim();
    if (description && String(description).trim()) farmData.description = String(description).trim();

    const farm = await Farm.create(farmData);
    res.status(201).json(farm);
  } catch (e) {
    console.error("Error adding farm:", e);
    res.status(500).json({ error: "Failed to add farm." });
  }
});

// GET /api/farms (search)
router.get("/farms", async (req, res) => {
  const zip = String(req.query.zip || "").trim();
  const city = String(req.query.city || "").trim();
  const state = String(req.query.state || "").trim();
  const radius = Number(req.query.radius || "30");

  if (!zip && !(city && state)) {
    return res.status(400).json({ error: "Please provide a zip code or 'City' and 'State'." });
  }

  try {
    await dbConnect();

    const query: Record<string, unknown> = {};
    if (zip) {
      query.zip = zip;
    } else {
      query.city = { $regex: new RegExp(`^${escapeRegex(city)}$`, "i") };
      query.state = { $regex: new RegExp(`^${escapeRegex(state)}$`, "i") };
    }

    const farms = (await Farm.find(query).sort({ createdAt: -1 }).limit(200)) as unknown as FarmDoc[];

    const dbFormatted = farms.map((farm) => ({
      _id: farm._id.toString(),
      MarketName: farm.name,
      Address: farm.address,
      City: farm.city,
      Zip: farm.zip,
      Phone: farm.phone || "",
      FarmType: farm.farmType,
      Description: farm.description,
    }));

    // Optionally augment with Google Places results if API key is present
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    type UiFarm = {
      _id?: string;
      MarketName: string;
      Address: string;
      City: string;
      Zip: string;
      Phone?: string;
      FarmType?: string;
      Description?: string;
      Lat?: number;
      Lng?: number;
    };

    let placesFormatted: UiFarm[] = [];

    type PlaceResult = {
      name: string;
      formatted_address: string;
      types?: string[];
      business_status?: string;
      geometry?: { location?: { lat: number; lng: number } };
    };

    type PlacesResponse = {
      results?: PlaceResult[];
    };

    if (apiKey) {
      try {
        const location = zip
          ? await geocodeZip(zip, apiKey)
          : await geocodeCityState(city, state, apiKey);

        if (location) {
          const meters = Math.max(1609, Math.min(50000, Math.round(radius * 1609.34)));
          const text = encodeURIComponent("farm OR farmers market");
          const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${text}&location=${location.lat},${location.lng}&radius=${meters}&key=${apiKey}`;
          const r = await fetch(url, { cache: "no-store" });
          if (r.ok) {
            const json = (await r.json().catch(() => ({}))) as PlacesResponse;
            if (Array.isArray(json.results)) {
              placesFormatted = json.results.map((p) => {
                const addr = String(p.formatted_address || "");
                const { city: c, zip: z } = parseCityZip(addr);
                const lat = p.geometry?.location?.lat;
                const lng = p.geometry?.location?.lng;
                return {
                  MarketName: String(p.name || ""),
                  Address: addr,
                  City: c || city,
                  Zip: z || zip,
                  Phone: "",
                  FarmType: "Other",
                  Description: (p.types || []).join(", ") || p.business_status || "",
                  Lat: typeof lat === "number" ? lat : undefined,
                  Lng: typeof lng === "number" ? lng : undefined,
                } as UiFarm;
              });
            }
          }
        }
      } catch (e) {
        console.warn("Google Places integration error:", e);
      }
    }

    const merged: UiFarm[] = [];
    const seen = new Set<string>();
    const pushUnique = (item: UiFarm) => {
      const key = `${(item.MarketName || "").toLowerCase()}|${item.Zip || ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    };

    dbFormatted.forEach(pushUnique);
    placesFormatted.forEach(pushUnique);

    res.json(merged);
  } catch (e) {
    console.error("Error searching farms:", e);
    res.status(500).json({ error: "Failed to fetch farm data." });
  }
});

// GET /api/farms/:id
router.get("/farms/:id", async (req, res) => {
  try {
    await dbConnect();
    const farm = (await Farm.findById(req.params.id)) as unknown as FarmDoc | null;
    if (!farm) {
      return res.status(404).json({ error: "Farm not found" });
    }
    res.json({
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
  } catch (e) {
    console.error("Error fetching farm:", e);
    res.status(500).json({ error: "Failed to fetch farm." });
  }
});

// PUT /api/farms/:id (auth required)
router.put("/farms/:id", requireAuth, async (req, res) => {
  try {
    await dbConnect();

    const { name, address, city, state, zip, phone, farmType, description } = req.body || {};
    if (!name || !address || !city || !state || !zip || !farmType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await Farm.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Farm not found" });
    }

    const updateData: Record<string, string> = { name, address, city, state, zip, farmType };
    if (phone && String(phone).trim()) updateData.phone = String(phone).trim();
    if (description && String(description).trim()) updateData.description = String(description).trim();

    await Farm.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: "Farm updated successfully" });
  } catch (e) {
    console.error("Error updating farm:", e);
    res.status(500).json({ error: "Failed to update farm." });
  }
});

// DELETE /api/farms/:id (auth required)
router.delete("/farms/:id", requireAuth, async (req, res) => {
  try {
    await dbConnect();

    const existing = await Farm.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Farm not found" });
    }

    await Farm.findByIdAndDelete(req.params.id);
    res.json({ message: "Farm deleted successfully" });
  } catch (e) {
    console.error("Error deleting farm:", e);
    res.status(500).json({ error: "Failed to delete farm." });
  }
});

export default router;

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}

async function geocodeZip(zip: string, apiKey: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(zip)}&components=country:US|postal_code:${encodeURIComponent(zip)}&key=${apiKey}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) return null;
  const json = (await r.json().catch(() => ({}))) as {
    results?: Array<{ geometry?: { location?: { lat: number; lng: number } } }>;
  };
  const loc = json?.results?.[0]?.geometry?.location;
  return loc ? { lat: loc.lat, lng: loc.lng } : null;
}

async function geocodeCityState(city: string, state: string, apiKey: string): Promise<{ lat: number; lng: number } | null> {
  const q = `${city}, ${state}, USA`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${apiKey}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) return null;
  const json = (await r.json().catch(() => ({}))) as {
    results?: Array<{ geometry?: { location?: { lat: number; lng: number } } }>;
  };
  const loc = json?.results?.[0]?.geometry?.location;
  return loc ? { lat: loc.lat, lng: loc.lng } : null;
}

function parseCityZip(formattedAddress: string): { city?: string; zip?: string } {
  const parts = formattedAddress.split(",").map((s) => s.trim());
  if (parts.length >= 3) {
    const city = parts[parts.length - 3];
    const stateZip = parts[parts.length - 2];
    const zipMatch = stateZip.match(/\b(\d{5})(?:-\d{4})?\b/);
    return { city, zip: zipMatch ? zipMatch[1] : undefined };
  }
  const zipMatch = formattedAddress.match(/\b(\d{5})(?:-\d{4})?\b/);
  return { zip: zipMatch ? zipMatch[1] : undefined };
}
