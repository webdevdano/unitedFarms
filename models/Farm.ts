import mongoose, { Schema, models } from "mongoose";

const FarmSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  phone: { type: String },
  description: { type: String, maxlength: 1000 },
  farmType: { 
    type: String, 
    required: true, 
    enum: ['Produce', 'Beef', 'Poultry', 'Dairy', 'All', 'Other'],
    default: 'Other'
  },
  lat: { type: Number },
  lng: { type: Number },
  createdAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
});

export default models.Farm || mongoose.model("Farm", FarmSchema);
