/**
 * Geocodes each seed address via Nominatim (no API key needed)
 * and prints updated seed rows with accurate lat/lng.
 * Run: npx tsx scripts/geocode-seeds.ts
 */

const addresses = [
  { name: "Green Valley Farm",          address: "2580 Nord Ave",               city: "Chico",        state: "CA", zip: "95973" },
  { name: "Central Harvest",            address: "8301 Claribel Rd",            city: "Modesto",      state: "CA", zip: "95357" },
  { name: "Sunrise Acres",              address: "1200 County Road 29",         city: "Woodland",     state: "CA", zip: "95695" },
  { name: "Sacramento Valley Organics", address: "9250 Sheldon Rd",             city: "Elk Grove",    state: "CA", zip: "95624" },
  { name: "Bay Area Fresh",             address: "9000 E Main Ave",             city: "Morgan Hill",  state: "CA", zip: "95037" },
  { name: "Lone Star Beef Co.",         address: "3414 Lyons Rd",               city: "Austin",       state: "TX", zip: "78702" },
  { name: "Hill Country Harvest",       address: "131 Racetrack Rd",            city: "Boerne",       state: "TX", zip: "78006" },
  { name: "Bluebonnet Farms",           address: "26010 Schiel Rd",             city: "Katy",         state: "TX", zip: "77494" },
  { name: "Hudson Valley Greens",       address: "22 Montgomery St",            city: "Rhinebeck",    state: "NY", zip: "12572" },
  { name: "Empire State Dairy",         address: "6654 Railroad Ave",           city: "Altamont",     state: "NY", zip: "12009" },
  { name: "Brooklyn Rooftop Farm",      address: "790 Onderdonk Ave",           city: "Brooklyn",     state: "NY", zip: "11385" },
  { name: "Sunshine Citrus Farm",       address: "12601 Citrus Grove Blvd",     city: "Clermont",     state: "FL", zip: "34714" },
  { name: "Everglades Free Range",      address: "24300 SW 162nd Ave",          city: "Homestead",    state: "FL", zip: "33031" },
  { name: "Rocky Mountain Ranch",       address: "8500 W Deer Creek Canyon Rd", city: "Littleton",    state: "CO", zip: "80128" },
  { name: "Colorado Organic Acres",     address: "9595 Ute Hwy",                city: "Longmont",     state: "CO", zip: "80504" },
  { name: "Prairie Wind Farm",          address: "38W748 Boncosky Rd",          city: "Elgin",        state: "IL", zip: "60124" },
  { name: "Great Lakes Dairy",          address: "1640 Pawnee Rd",              city: "Chatham",      state: "IL", zip: "62629" },
  { name: "Peach State Farms",          address: "324 Marshallville Rd",        city: "Fort Valley",  state: "GA", zip: "31030" },
  { name: "Cascade Berry Farm",         address: "7809 Marsh Rd",               city: "Snohomish",    state: "WA", zip: "98290" },
  { name: "Olympic Valley Ranch",       address: "41404 State Route 7",         city: "Eatonville",   state: "WA", zip: "98328" },
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
  for (const a of addresses) {
    const result = await geocode(a.address, a.city, a.state, a.zip);
    if (result) {
      console.log(`✓ ${a.name.padEnd(30)} lat: ${result.lat.toFixed(4)}, lng: ${result.lng.toFixed(4)}`);
      console.log(`  → ${result.display}`);
    } else {
      console.log(`✗ ${a.name} — NOT FOUND`);
    }
    // Nominatim rate limit: 1 req/sec
    await new Promise(r => setTimeout(r, 1100));
  }
})();
