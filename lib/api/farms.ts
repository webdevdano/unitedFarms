import type { FarmSearchParams } from "../store/useFarmSearchStore";

export type UiFarm = {
  _id?: string;
  MarketName: string;
  Address: string;
  City: string;
  State?: string;
  Zip: string;
  Phone?: string;
  Produces?: string[];
  Description?: string;
  Lat?: number;
  Lng?: number;
};

export type AddFarmInput = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  produces: string[];
  description?: string;
};

type ErrorShape = { error?: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readJsonOrThrow(res: Response): Promise<unknown> {
  const json: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (isRecord(json) && typeof (json as ErrorShape).error === "string" && (json as ErrorShape).error) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }
  return json;
}

export async function fetchFarms(params: FarmSearchParams): Promise<UiFarm[]> {
  let url = "/api/farms";
  if (params.kind === "zip") {
    url += `?zip=${encodeURIComponent(params.zip)}&radius=${encodeURIComponent(String(params.radiusMiles))}`;
  } else {
    url += `?city=${encodeURIComponent(params.city)}&state=${encodeURIComponent(params.state)}`;
  }

  const res = await fetch(url, { cache: "no-store" });
  const json = await readJsonOrThrow(res);
  return Array.isArray(json) ? (json as UiFarm[]) : [];
}

export async function fetchUserFarms(): Promise<UiFarm[]> {
  const res = await fetch("/api/user-farms", { cache: "no-store" });
  const json = await readJsonOrThrow(res);
  return Array.isArray(json) ? (json as UiFarm[]) : [];
}

export async function addFarm(input: AddFarmInput): Promise<UiFarm> {
  const res = await fetch("/api/add-farm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const created = await readJsonOrThrow(res);

  const createdRecord = isRecord(created) ? created : {};
  const getString = (key: string) => (typeof createdRecord[key] === "string" ? (createdRecord[key] as string) : "");

  // Map created farm to UI shape expected by lists
  const getNumber = (key: string) =>
    typeof createdRecord[key] === "number" ? (createdRecord[key] as number) : undefined;

  return {
    _id: getString("_id"),
    MarketName: getString("name"),
    Address: getString("address"),
    City: getString("city"),
    State: getString("state"),
    Zip: getString("zip"),
    Phone: getString("phone"),
    Produces: Array.isArray(createdRecord["produces"]) ? (createdRecord["produces"] as string[]) : [],
    Description: getString("description"),
    Lat: getNumber("lat"),
    Lng: getNumber("lng"),
  };
}
