/**
 * Geocodes each seed address via Nominatim (no API key needed)
 * and prints updated seed rows with accurate lat/lng.
 * Run: npx tsx scripts/geocode-seeds.ts
 */

const addresses = [
  // California
  { name: "Full Belly Farm",                   address: "38375 Road 68",          city: "Guinda",        state: "CA", zip: "95637", produces: ["Vegetables","Fruits","Herbs"],         description: "Certified organic diversified farm in the Capay Valley." },
  { name: "Frog Hollow Farm",                  address: "100 Modesto Ave",        city: "Brentwood",     state: "CA", zip: "94513", produces: ["Fruits"],                            description: "Award-winning organic stone fruit farm in the East Bay." },
  { name: "Flying Mule Farm",                  address: "13390 Bell Rd",          city: "Auburn",        state: "CA", zip: "95603", produces: ["Beef","Pork","Lamb"],                 description: "Grass-fed beef and pasture-raised pork in Gold Country." },
  { name: "Riverdog Farm",                     address: "18820 County Rd 87",     city: "Guinda",        state: "CA", zip: "95637", produces: ["Vegetables","Fruits","Poultry"],      description: "Organic vegetable and fruit farm in the Capay Valley." },
  // Texas
  { name: "Boggy Creek Farm",                  address: "3414 Lyons Rd",          city: "Austin",        state: "TX", zip: "78702", produces: ["Vegetables","Herbs","Eggs"],          description: "Historic urban farm in East Austin, open since 1992." },
  { name: "Johnson's Backyard Garden",         address: "9306 Rogge Ln",          city: "Austin",        state: "TX", zip: "78724", produces: ["Vegetables","Herbs"],                 description: "CSA farm growing over 30 organic vegetable varieties." },
  // New York
  { name: "Stone Barns Center",                address: "630 Bedford Rd",         city: "Sleepy Hollow", state: "NY", zip: "10591", produces: ["Vegetables","Beef","Pork","Poultry","Eggs"], description: "Four-season farm and educational center north of NYC." },
  { name: "Soul Fire Farm",                    address: "40 Wilbur Rd",           city: "Grafton",       state: "NY", zip: "12082", produces: ["Vegetables","Fruits","Herbs"],         description: "Afro-Indigenous centered community farm and reparations project." },
  { name: "Hearty Roots Community Farm",       address: "3727 NY-9G",             city: "Germantown",    state: "NY", zip: "12526", produces: ["Vegetables","Herbs"],                 description: "Hudson Valley CSA farm delivering to NYC and locally." },
  // Virginia
  { name: "Polyface Farm",                     address: "43 Pure Meadows Ln",     city: "Swoope",        state: "VA", zip: "24479", produces: ["Beef","Pork","Poultry","Eggs","Lamb"], description: "Joel Salatin's regenerative farm, featured in The Omnivore's Dilemma." },
  // Florida
  { name: "Worden Farm",                       address: "34900 Bermont Rd",       city: "Punta Gorda",   state: "FL", zip: "33982", produces: ["Vegetables","Herbs"],                 description: "Certified organic vegetable farm on Florida's southwest coast." },
  { name: "Alderman Farms",                    address: "2886 Alderman Rd",       city: "Kissimmee",     state: "FL", zip: "34744", produces: ["Beef","Pork","Poultry"],              description: "Family cattle and livestock farm near Orlando." },
  // Colorado
  { name: "Grant Family Farms",                address: "825 E County Rd 56",     city: "Wellington",    state: "CO", zip: "80549", produces: ["Vegetables","Herbs"],                 description: "Colorado's largest organic CSA serving the Front Range." },
  // Illinois
  { name: "Kinnikinnick Farm",                 address: "21123 Sycamore Rd",      city: "Caledonia",     state: "IL", zip: "61011", produces: ["Vegetables","Fruits","Herbs"],         description: "Biodynamic farm near Rockford growing over 150 crop varieties." },
  // Georgia
  { name: "Crystal Organic Farm",              address: "3880 Campton Rd",        city: "Newborn",       state: "GA", zip: "30056", produces: ["Vegetables","Fruits"],                description: "Certified organic farm east of Atlanta." },
  // Wisconsin
  { name: "Harmony Valley Farm",               address: "W7507 Powers Coulee Rd", city: "Viroqua",       state: "WI", zip: "54665", produces: ["Vegetables","Herbs","Fruits"],         description: "Organic CSA farm in the Driftless region of southwest Wisconsin." },
  // Ohio
  { name: "Snowville Creamery",                address: "32166 Portersville Rd",  city: "Pomeroy",       state: "OH", zip: "45769", produces: ["Dairy"],                             description: "Grass-fed dairy creamery sourcing from local Ohio farms." },
  // Washington
  { name: "Oxbow Farm & Conservation Center",  address: "8514 NE 119th St",       city: "Carnation",     state: "WA", zip: "98014", produces: ["Vegetables","Herbs","Fruits"],         description: "Organic farm in the Snoqualmie River valley." },
  { name: "Nash's Organic Produce",            address: "1865 E Anderson Rd",     city: "Sequim",        state: "WA", zip: "98382", produces: ["Vegetables","Herbs","Dairy"],          description: "Pioneer organic farm on the Olympic Peninsula since the 1970s." },
  { name: "Biringer Farm",                     address: "12918 State Ave",        city: "Marysville",    state: "WA", zip: "98271", produces: ["Fruits","Vegetables"],                description: "Pick-your-own berry farm north of Seattle open since 1977." },
];

async function geocode(address: string, city: string, state: string, zip: string) {
  const q = encodeURIComponent(`${address}, ${city}, ${state} ${zip}, USA`);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=us`;
  const res = await fetch(url, { headers: { "User-Agent": "UFA-seed-script/1.0" } });
  const json = await res.json() as Array<{ lat: string; lon: string; display_name: string }>;
  if (json.length === 0) return null;
  return { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon), display: json[0].display_name };
}

(async () => {
  console.log("Geocoding real farms...\n");
  for (const a of addresses) {
    const result = await geocode(a.address, a.city, a.state, a.zip);
    if (result) {
      const lat = result.lat.toFixed(4);
      const lng = result.lng.toFixed(4);
      console.log(`✓ ${a.name}`);
      console.log(`  → ${result.display.substring(0, 90)}`);
      console.log(`  lat: ${lat}  lng: ${lng}\n`);
    } else {
      console.log(`✗ NOT FOUND: ${a.name} — ${a.address}, ${a.city}, ${a.state}\n`);
    }
    await new Promise(r => setTimeout(r, 1100));
  }
})();
