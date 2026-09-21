import mongoose, { Schema, Document, Types } from "mongoose";
import type { IFuel } from "./Fuel";
import type { ISupplier } from "./Supplier";

export interface IFuelPriceVersion extends Document {
  _id: Types.ObjectId;
  fuel: Types.ObjectId | IFuel;
  supplier: Types.ObjectId | ISupplier;
  version: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const FuelPriceVersionSchema = new Schema<IFuelPriceVersion>(
  {
    fuel: { type: Types.ObjectId, required: true, ref: "Fuel" },
    supplier: { type: Types.ObjectId, required: true, ref: "Supplier" },
    version: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true },
);

/**
 * ÍNDICE COMPOSTO ÚNICO
 * Garante que não existam duas "Gasolina" com versão "1".
 * Mas permite "Gasolina" v1 e "Diesel" v1.
 */
FuelPriceVersionSchema.index({ fuel: 1, version: 1 }, { unique: true });

export default mongoose.models.FuelPriceVersion ||
  mongoose.model<IFuelPriceVersion>("FuelPriceVersion", FuelPriceVersionSchema);
