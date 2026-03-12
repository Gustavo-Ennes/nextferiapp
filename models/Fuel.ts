import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFuel extends Document {
  _id: Types.ObjectId;
  name: string;
  unit: string; // ex: "L" to liters
  pricePerUnit: number;
  createdAt: Date;
  updatedAt: Date;
}

const FuelSchema = new Schema<IFuel>(
  {
    name: { type: String, required: true, unique: true },
    unit: { type: String, required: true, default: "L" },
    pricePerUnit: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.Fuel ||
  mongoose.model<IFuel>("Fuel", FuelSchema);
