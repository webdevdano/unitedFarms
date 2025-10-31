import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get("zip") || "";
  const city = searchParams.get("city") || "";
  const state = searchParams.get("state") || "";
  const radius = searchParams.get("radius") || "30";
  let endpoint = "https://www.usdalocalfoodportal.com/api/onfarmmarket/?apikey=DOizpwByEK";
  try {
    if (zip) {
      endpoint += `&zip=${encodeURIComponent(zip)}&radius=${encodeURIComponent(radius)}`;
    } else if (city && state) {
      endpoint += `&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;
    } else {
      // fallback: return error if no valid location
      return NextResponse.json({ error: "Please provide a zip code or city and state." }, { status: 400 });
    }
    console.log("Fetching USDA endpoint:", endpoint);
    const res = await fetch(endpoint, {
      headers: {
        "User-Agent": "UFA-Nextjs-App/1.0"
      }
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("USDA API error:", res.status, errorText);
      return NextResponse.json({ error: `USDA API error: ${res.status}`, raw: errorText }, { status: res.status });
    }
    let farms = [];
    try {
      farms = await res.json();
      if (!Array.isArray(farms)) {
        throw new Error("USDA API did not return an array");
      }
    } catch (jsonErr) {
      console.error("JSON parse error:", jsonErr);
      const rawText = await res.text();
      return NextResponse.json({ error: "USDA API did not return valid JSON", raw: rawText }, { status: 500 });
    }
    return NextResponse.json(farms);
  } catch (error) {
    console.error("Error fetching farm data:", error);
    return NextResponse.json({ error: "Failed to fetch farm data." }, { status: 500 });
  }
}