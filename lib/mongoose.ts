import mongoose, { type Mongoose } from "mongoose";

declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

function buildUri(): string {
  const raw = process.env.MONGODB_URI || "mongodb://localhost:27017/ufa";
  // Ensure a database name is present so Mongoose doesn't connect to 'test'.
  // Atlas URIs end with '/' (no db name) — append 'ufa' in that case.
  try {
    const url = new URL(raw);
    if (!url.pathname || url.pathname === "/") {
      url.pathname = "/ufa";
    }
    return url.toString();
  } catch {
    return raw;
  }
}

const MONGODB_URI = buildUri();

let cached = global.mongoose;

if (!cached) {
  global.mongoose = { conn: null, promise: null };
  cached = global.mongoose;
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { dbName: "ufa" })
      .then((m) => m)
      .catch((err) => {
        // Reset so future requests retry rather than using a cached rejection.
        cached.promise = null;
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
