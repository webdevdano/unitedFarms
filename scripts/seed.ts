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
  { name: "Full Belly Farm",                  city: "Guinda",        state: "CA", zip: "95637", address: "38375 Road 68",          phone: "(530) 796-2214", produces: ["Vegetables","Fruits","Herbs","Flowers"],  lat: 38.8282,  lng: -122.1855, description: "Certified organic diversified farm in the Capay Valley. CSA since 1985." },
  { name: "Frog Hollow Farm",                 city: "Brentwood",     state: "CA", zip: "94513", address: "100 Modesto Ave",        phone: "(925) 634-2845", produces: ["Fruits"],                                lat: 37.9358,  lng: -121.7093, description: "Award-winning organic stone fruit farm in the East Bay. Known for peaches, nectarines, and apricots." },
  { name: "Flying Mule Farm",                 city: "Auburn",        state: "CA", zip: "95603", address: "13390 Bell Rd",          phone: "(530) 268-0500", produces: ["Beef","Pork","Lamb"],                     lat: 38.8766,  lng: -121.1009, description: "Grass-fed beef and pasture-raised pork in the Sierra Nevada foothills." },
  { name: "Riverdog Farm",                    city: "Guinda",        state: "CA", zip: "95637", address: "18820 County Rd 87",     phone: "(530) 796-3802", produces: ["Vegetables","Fruits","Poultry"],          lat: 38.8297,  lng: -122.1831, description: "Certified organic farm in the Capay Valley growing 80+ varieties of vegetables and fruits." },
  // Texas
  { name: "Boggy Creek Farm",                 city: "Austin",        state: "TX", zip: "78702", address: "3414 Lyons Rd",          phone: "(512) 926-4650", produces: ["Vegetables","Herbs","Eggs","Flowers"],    lat: 30.2620,  lng: -97.7014,  description: "Historic urban farm in East Austin operating since 1992. Open-air farm stand on weekends." },
  { name: "Johnson's Backyard Garden",        city: "Austin",        state: "TX", zip: "78724", address: "9306 Rogge Ln",          phone: "(512) 386-5273", produces: ["Vegetables","Herbs"],                     lat: 30.3015,  lng: -97.6750,  description: "CSA farm in East Austin growing 30+ organic vegetable varieties year-round." },
  // New York
  { name: "Stone Barns Center",               city: "Sleepy Hollow", state: "NY", zip: "10591", address: "630 Bedford Rd",         phone: "(914) 366-6200", produces: ["Vegetables","Beef","Pork","Poultry","Eggs","Herbs"], lat: 41.0864, lng: -73.8571, description: "Four-season working farm and educational center 25 miles north of NYC." },
  { name: "Soul Fire Farm",                   city: "Grafton",       state: "NY", zip: "12082", address: "40 Wilbur Rd",           phone: "(518) 669-0952", produces: ["Vegetables","Fruits","Herbs"],            lat: 42.7649,  lng: -73.5165,  description: "Afro-Indigenous centered community farm and food sovereignty project." },
  { name: "Hearty Roots Community Farm",      city: "Germantown",    state: "NY", zip: "12526", address: "3727 NY-9G",             phone: "(845) 943-5860", produces: ["Vegetables","Herbs"],                     lat: 42.1366,  lng: -73.8907,  description: "Hudson Valley organic CSA farm delivering to NYC and the Hudson Valley." },
  // Virginia
  { name: "Polyface Farm",                    city: "Swoope",        state: "VA", zip: "24479", address: "43 Pure Meadows Ln",     phone: "(540) 885-3590", produces: ["Beef","Pork","Poultry","Eggs","Lamb","Rabbit"], lat: 38.1185, lng: -79.2274, description: "Joel Salatin's world-famous regenerative farm, as featured in The Omnivore's Dilemma." },
  // Florida
  { name: "Worden Farm",                      city: "Punta Gorda",   state: "FL", zip: "33982", address: "34900 Bermont Rd",       phone: "(941) 637-3552", produces: ["Vegetables","Herbs"],                     lat: 26.8937,  lng: -81.9562,  description: "Certified organic vegetable farm on 85 acres in Charlotte County." },
  { name: "Alderman Farms",                   city: "Kissimmee",     state: "FL", zip: "34744", address: "2886 Alderman Rd",       phone: "(407) 933-5276", produces: ["Beef","Pork","Poultry","Eggs"],           lat: 28.2853,  lng: -81.4229,  description: "Fifth-generation family farm raising cattle and livestock near Orlando." },
  // Colorado
  { name: "Grant Family Farms",               city: "Wellington",    state: "CO", zip: "80549", address: "825 E County Rd 56",     phone: "(970) 568-7654", produces: ["Vegetables","Herbs"],                     lat: 40.7018,  lng: -104.9658, description: "Colorado's largest organic CSA, serving over 4,000 families on the Front Range." },
  // Illinois
  { name: "Kinnikinnick Farm",                city: "Caledonia",     state: "IL", zip: "61011", address: "21123 Sycamore Rd",      phone: "(815) 765-2202", produces: ["Vegetables","Fruits","Herbs","Flowers"],  lat: 42.3695,  lng: -88.8836,  description: "Biodynamic farm near Rockford growing over 150 crop varieties for farmers markets and CSA." },
  // Georgia
  { name: "Crystal Organic Farm",             city: "Newborn",       state: "GA", zip: "30056", address: "3880 Campton Rd",        phone: "(770) 787-8074", produces: ["Vegetables","Fruits"],                   lat: 33.5291,  lng: -83.6884,  description: "Certified organic farm in Newton County growing diverse seasonal vegetables." },
  // Wisconsin
  { name: "Harmony Valley Farm",              city: "Viroqua",       state: "WI", zip: "54665", address: "W7507 Powers Coulee Rd", phone: "(608) 483-2143", produces: ["Vegetables","Herbs","Fruits"],            lat: 43.5523,  lng: -90.8706,  description: "100+ acre certified organic CSA farm in the Driftless region of southwest Wisconsin." },
  // Ohio
  { name: "Snowville Creamery",               city: "Pomeroy",       state: "OH", zip: "45769", address: "32166 Portersville Rd",  phone: "(740) 992-6464", produces: ["Dairy"],                                 lat: 38.9940,  lng: -82.0269,  description: "Grass-fed dairy creamery and bottler sourcing milk from local Ohio farms." },
  // Washington
  { name: "Oxbow Farm & Conservation Center", city: "Carnation",     state: "WA", zip: "98014", address: "8514 NE 119th St",       phone: "(425) 333-6012", produces: ["Vegetables","Herbs","Fruits"],            lat: 47.6500,  lng: -121.9128, description: "Organic farm and conservation center in the Snoqualmie River valley east of Seattle." },
  { name: "Nash's Organic Produce",           city: "Sequim",        state: "WA", zip: "98382", address: "1865 E Anderson Rd",     phone: "(360) 683-4642", produces: ["Vegetables","Grains","Dairy"],            lat: 48.0707,  lng: -123.0949, description: "Pioneer organic farm on the Olympic Peninsula, growing since the 1970s." },
  { name: "Biringer Farm",                    city: "Marysville",    state: "WA", zip: "98271", address: "12918 State Ave",        phone: "(360) 659-3276", produces: ["Fruits","Vegetables"],                   lat: 48.1203,  lng: -122.1825, description: "Pick-your-own strawberry and blueberry farm north of Seattle, open since 1977." },
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
