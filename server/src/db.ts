import mongoose, { type Mongoose } from "mongoose";

let cached: { conn: Mongoose | null; promise: Promise<Mongoose> | null } | null = null;

export async function dbConnect() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ufa";
  if (!uri) throw new Error("MONGODB_URI is not set");

  if (!cached) cached = { conn: null, promise: null };

  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, { bufferCommands: false })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
