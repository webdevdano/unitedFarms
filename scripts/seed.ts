/**
 * Seed script – populates the farms collection with sample data.
 * Run: npx tsx scripts/seed.ts
 */
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = (() => {
  const raw = process.env.MONGODB_URI || "mongodb://localhost:27017/ufa";
  try {
    const url = new URL(raw);
    if (!url.pathname || url.pathname === "/") url.pathname = "/ufa";
    return url.toString();
  } catch {
    return raw;
  }
})();

const FarmSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  address:     { type: String, required: true },
  city:        { type: String, required: true },
  state:       { type: String, required: true },
  zip:         { type: String, required: true },
  phone:       { type: String },
  description: { type: String },
  produces:    { type: [String], default: [] },
  lat:         { type: Number },
  lng:         { type: Number },
  createdAt:   { type: Date, default: Date.now },
  verified:    { type: Boolean, default: false },
});

const Farm = mongoose.models.Farm || mongoose.model("Farm", FarmSchema);

const seeds = [
  // California
  { name: "Green Valley Farm",          city: "Chico",        state: "CA", zip: "95928", address: "123 Orchard Rd",        phone: "(530) 555-1234", produces: ["Vegetables","Fruits"],              lat: 39.7285,  lng: -121.8375, description: "Family-run produce farm in northern California." },
  { name: "Central Harvest",            city: "Modesto",      state: "CA", zip: "95350", address: "456 Farm Lane",          phone: "(209) 555-5678", produces: ["Vegetables","Poultry","Eggs"],      lat: 37.6391,  lng: -120.9969, description: "Mixed produce and poultry farm." },
  { name: "Sunrise Acres",              city: "Davis",        state: "CA", zip: "95616", address: "789 Sunrise Blvd",       phone: "(530) 555-9012", produces: ["Dairy","Eggs"],                    lat: 38.5449,  lng: -121.7405, description: "Organic dairy farm near UC Davis." },
  { name: "Sacramento Valley Organics", city: "Sacramento",   state: "CA", zip: "95814", address: "1010 River Rd",          phone: "(916) 555-3344", produces: ["Vegetables","Herbs","Fruits"],     lat: 38.5816,  lng: -121.4944, description: "Certified organic vegetables and herbs." },
  { name: "Bay Area Fresh",             city: "San Jose",     state: "CA", zip: "95101", address: "222 Valley Way",         phone: "(408) 555-7788", produces: ["Vegetables","Fruits","Flowers"],   lat: 37.3382,  lng: -121.8863, description: "Year-round farmers market supplier." },
  // Texas
  { name: "Lone Star Beef Co.",         city: "Austin",       state: "TX", zip: "78701", address: "500 Cattle Drive",       phone: "(512) 555-2211", produces: ["Beef"],                            lat: 30.2672,  lng: -97.7431,  description: "Pasture-raised Texas longhorn beef." },
  { name: "Hill Country Harvest",       city: "San Antonio",  state: "TX", zip: "78201", address: "300 Hilltop Rd",         phone: "(210) 555-4455", produces: ["Vegetables","Fruits"],             lat: 29.4241,  lng: -98.4936,  description: "Seasonal vegetables and peaches." },
  { name: "Bluebonnet Farms",           city: "Houston",      state: "TX", zip: "77001", address: "88 Prairie Ln",          phone: "(713) 555-6677", produces: ["Beef","Pork","Poultry","Eggs"],    lat: 29.7604,  lng: -95.3698,  description: "Full-service family farm." },
  // New York
  { name: "Hudson Valley Greens",       city: "Poughkeepsie", state: "NY", zip: "12601", address: "14 Orchard Hill Rd",     phone: "(845) 555-8800", produces: ["Vegetables","Herbs"],              lat: 41.7004,  lng: -73.9210,  description: "Hudson Valley heirloom greens and root vegetables." },
  { name: "Empire State Dairy",         city: "Albany",       state: "NY", zip: "12201", address: "77 Meadow Ln",           phone: "(518) 555-1122", produces: ["Dairy","Honey"],                   lat: 42.6526,  lng: -73.7562,  description: "Award-winning artisan cheeses and local honey." },
  { name: "Brooklyn Rooftop Farm",      city: "Brooklyn",     state: "NY", zip: "11201", address: "1 Rooftop Way",          phone: "(718) 555-3344", produces: ["Vegetables","Herbs","Flowers"],    lat: 40.6782,  lng: -73.9442,  description: "Urban rooftop garden and CSA." },
  // Florida
  { name: "Sunshine Citrus Farm",       city: "Orlando",      state: "FL", zip: "32801", address: "400 Orange Blossom Trl", phone: "(407) 555-5511", produces: ["Fruits"],                          lat: 28.5383,  lng: -81.3792,  description: "Fresh-squeezed OJ and citrus." },
  { name: "Everglades Free Range",      city: "Miami",        state: "FL", zip: "33101", address: "99 Palmetto Blvd",       phone: "(305) 555-9900", produces: ["Poultry","Eggs"],                  lat: 25.7617,  lng: -80.1918,  description: "Free-range chicken and eggs." },
  // Colorado
  { name: "Rocky Mountain Ranch",       city: "Denver",       state: "CO", zip: "80201", address: "1200 Mountain View Dr",  phone: "(720) 555-2233", produces: ["Beef","Lamb"],                     lat: 39.7392,  lng: -104.9903, description: "Grass-fed beef and lamb at altitude." },
  { name: "Colorado Organic Acres",     city: "Boulder",      state: "CO", zip: "80301", address: "55 Foothills Pkwy",      phone: "(303) 555-4400", produces: ["Vegetables","Fruits","Herbs"],     lat: 40.0150,  lng: -105.2705, description: "USDA certified organic mixed vegetables." },
  // Illinois
  { name: "Prairie Wind Farm",          city: "Chicago",      state: "IL", zip: "60601", address: "700 Lake Shore Blvd",    phone: "(312) 555-6688", produces: ["Vegetables","Herbs"],              lat: 41.8781,  lng: -87.6298,  description: "Urban farm serving the South Side." },
  { name: "Great Lakes Dairy",          city: "Springfield",  state: "IL", zip: "62701", address: "210 Corn Belt Rd",       phone: "(217) 555-7799", produces: ["Dairy","Eggs"],                    lat: 39.7817,  lng: -89.6501,  description: "Family dairy since 1952." },
  // Georgia
  { name: "Peach State Farms",          city: "Atlanta",      state: "GA", zip: "30301", address: "300 Peachtree St SW",    phone: "(404) 555-0011", produces: ["Fruits","Vegetables","Honey"],     lat: 33.7490,  lng: -84.3880,  description: "Georgia peaches, sweet onions, and local honey." },
  // Washington
  { name: "Cascade Berry Farm",         city: "Seattle",      state: "WA", zip: "98101", address: "900 Cascade Way",        phone: "(206) 555-3322", produces: ["Fruits","Vegetables"],             lat: 47.6062,  lng: -122.3321, description: "PNW strawberries, blueberries, and raspberries." },
  { name: "Olympic Valley Ranch",       city: "Tacoma",       state: "WA", zip: "98401", address: "150 Rainier View Rd",    phone: "(253) 555-5544", produces: ["Beef","Lamb","Pork"],              lat: 47.2529,  lng: -122.4443, description: "Hormone-free beef, lamb, and pork." },
];

async function seed() {
  console.log("Connecting to:", MONGODB_URI.replace(/:([^@]+)@/, ":****@"));
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  const existing = await Farm.countDocuments();
  if (existing > 0) {
    console.log(`Database already has ${existing} farm(s). Skipping insert. Pass --force to overwrite.`);
    if (!process.argv.includes("--force")) {
      await mongoose.disconnect();
      return;
    }
    await Farm.deleteMany({});
    console.log("Cleared existing farms.");
  }

  await Farm.insertMany(seeds);
  console.log(`✓ Inserted ${seeds.length} farms.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
