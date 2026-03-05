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
  { name: "Green Valley Farm",          city: "Chico",       state: "CA", zip: "95973", address: "2580 Nord Ave",              phone: "(530) 555-1234", produces: ["Vegetables","Fruits"],             lat: 39.7461,  lng: -121.8841, description: "Family-run produce farm in northern California." },
  { name: "Central Harvest",            city: "Modesto",     state: "CA", zip: "95356", address: "3200 Kiernan Ave",           phone: "(209) 555-5678", produces: ["Vegetables","Poultry","Eggs"],     lat: 37.6952,  lng: -120.9476, description: "Mixed produce and poultry farm." },
  { name: "Sunrise Acres",              city: "Woodland",    state: "CA", zip: "95695", address: "79 County Road 98",          phone: "(530) 555-9012", produces: ["Dairy","Eggs"],                   lat: 38.6526,  lng: -121.7737, description: "Organic dairy farm near UC Davis." },
  { name: "Sacramento Valley Organics", city: "Elk Grove",   state: "CA", zip: "95624", address: "9250 Sheldon Rd",            phone: "(916) 555-3344", produces: ["Vegetables","Herbs","Fruits"],    lat: 38.4380,  lng: -121.3537, description: "Certified organic vegetables and herbs." },
  { name: "Bay Area Fresh",             city: "Morgan Hill", state: "CA", zip: "95037", address: "9000 E Main Ave",            phone: "(408) 555-7788", produces: ["Vegetables","Fruits","Flowers"],  lat: 37.1397,  lng: -121.6427, description: "Year-round farmers market supplier." },
  // Texas
  { name: "Lone Star Beef Co.",         city: "Austin",      state: "TX", zip: "78702", address: "3414 Lyons Rd",              phone: "(512) 555-2211", produces: ["Beef"],                           lat: 30.2620,  lng: -97.7014,  description: "Pasture-raised Texas longhorn beef." },
  { name: "Hill Country Harvest",       city: "Boerne",      state: "TX", zip: "78006", address: "205 River Rd",               phone: "(210) 555-4455", produces: ["Vegetables","Fruits"],            lat: 29.7979,  lng: -98.7388,  description: "Seasonal vegetables and peaches." },
  { name: "Bluebonnet Farms",           city: "Katy",        state: "TX", zip: "77493", address: "1620 Pin Oak Rd",            phone: "(713) 555-6677", produces: ["Beef","Pork","Poultry","Eggs"],   lat: 29.7848,  lng: -95.8263,  description: "Full-service family farm." },
  // New York
  { name: "Hudson Valley Greens",       city: "Rhinebeck",   state: "NY", zip: "12572", address: "22 Montgomery St",           phone: "(845) 555-8800", produces: ["Vegetables","Herbs"],             lat: 41.9272,  lng: -73.9125,  description: "Hudson Valley heirloom greens and root vegetables." },
  { name: "Empire State Dairy",         city: "Altamont",    state: "NY", zip: "12009", address: "Brandle Rd",                 phone: "(518) 555-1122", produces: ["Dairy","Honey"],                  lat: 42.7001,  lng: -74.0482,  description: "Award-winning artisan cheeses and local honey." },
  { name: "Brooklyn Rooftop Farm",      city: "Brooklyn",    state: "NY", zip: "11385", address: "790 Onderdonk Ave",          phone: "(718) 555-3344", produces: ["Vegetables","Herbs","Flowers"],   lat: 40.7134,  lng: -73.9231,  description: "Urban rooftop garden and CSA." },
  // Florida
  { name: "Sunshine Citrus Farm",       city: "Leesburg",    state: "FL", zip: "34748", address: "22625 US Hwy 27",            phone: "(407) 555-5511", produces: ["Fruits"],                         lat: 28.8270,  lng: -81.8806,  description: "Fresh-squeezed OJ and citrus." },
  { name: "Everglades Free Range",      city: "Homestead",   state: "FL", zip: "33031", address: "24300 SW 162nd Ave",         phone: "(305) 555-9900", produces: ["Poultry","Eggs"],                 lat: 25.5407,  lng: -80.4537,  description: "Free-range chicken and eggs." },
  // Colorado
  { name: "Rocky Mountain Ranch",       city: "Littleton",   state: "CO", zip: "80128", address: "8500 Deer Creek Canyon Rd", phone: "(720) 555-2233", produces: ["Beef","Lamb"],                    lat: 39.5406,  lng: -105.0895, description: "Grass-fed beef and lamb at altitude." },
  { name: "Colorado Organic Acres",     city: "Longmont",    state: "CO", zip: "80501", address: "9595 Ute Hwy",               phone: "(303) 555-4400", produces: ["Vegetables","Fruits","Herbs"],    lat: 40.2035,  lng: -105.0639, description: "USDA certified organic mixed vegetables." },
  // Illinois
  { name: "Prairie Wind Farm",          city: "Hampshire",   state: "IL", zip: "60140", address: "42W540 Nesler Rd",           phone: "(312) 555-6688", produces: ["Vegetables","Herbs"],             lat: 42.1417,  lng: -88.5261,  description: "Urban farm serving the Chicago area." },
  { name: "Great Lakes Dairy",          city: "Springfield", state: "IL", zip: "62702", address: "3249 Waggoner Rd",           phone: "(217) 555-7799", produces: ["Dairy","Eggs"],                   lat: 39.7617,  lng: -89.7282,  description: "Family dairy since 1952." },
  // Georgia
  { name: "Peach State Farms",          city: "Fort Valley", state: "GA", zip: "31030", address: "308 GA-96",                  phone: "(404) 555-0011", produces: ["Fruits","Vegetables","Honey"],    lat: 32.5558,  lng: -83.8927,  description: "Georgia peaches, sweet onions, and local honey." },
  // Washington
  { name: "Cascade Berry Farm",         city: "Snohomish",   state: "WA", zip: "98296", address: "7809 Marsh Rd",              phone: "(206) 555-3322", produces: ["Fruits","Vegetables"],            lat: 47.8992,  lng: -122.1264, description: "PNW strawberries, blueberries, and raspberries." },
  { name: "Olympic Valley Ranch",       city: "Eatonville",  state: "WA", zip: "98328", address: "107 Center St W",            phone: "(253) 555-5544", produces: ["Beef","Lamb","Pork"],             lat: 46.8669,  lng: -122.2693, description: "Hormone-free beef, lamb, and pork." },
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
