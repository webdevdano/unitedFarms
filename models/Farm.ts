import mongoose, { Schema, models } from "mongoose";

const FarmSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  phone: { type: String },
  description: { type: String, maxlength: 1000 },
  produces: { type: [String], default: [] },
  lat: { type: Number },
  lng: { type: Number },
  createdBy: { type: String, default: null }, // user _id string, null = anonymous
  createdAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
});

export default models.Farm || mongoose.model("Farm", FarmSchema);
