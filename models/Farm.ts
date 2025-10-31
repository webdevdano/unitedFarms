import mongoose, { Schema, models } from "mongoose";

const FarmSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
});

export default models.Farm || mongoose.model("Farm", FarmSchema);
