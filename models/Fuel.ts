import mongoose, { Schema, Document, Types } from "mongoose";
import { type IFuelPriceVersion } from "./FuelPriceVersion";
import "./FuelPriceVersion";

export interface IFuel extends Document {
  _id: Types.ObjectId;
  name: string;
  unit: string;
  priceVersions: IFuelPriceVersion[] | Types.ObjectId[];
  currentPriceVersion: IFuelPriceVersion | Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FuelSchema = new Schema<IFuel>(
  {
    name: { type: String, required: true, unique: true },
    unit: { type: String, required: true, default: "L" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/**
 * VIRTUAL POPULATE:
 * Cria um campo 'priceVersions' que busca todos os documentos de
 * 'FuelPriceVersion' onde o campo 'fuel' seja igual ao '_id' deste Fuel.
 */
FuelSchema.virtual("priceVersions", {
  ref: "FuelPriceVersion", // O model que será buscado
  localField: "_id", // Campo neste model (Fuel)
  foreignField: "fuel", // Campo no model de destino (FuelPriceVersion)
  justOne: false, // Queremos uma lista (array), não apenas um
});
FuelSchema.virtual("currentPriceVersion", {
  ref: "FuelPriceVersion",
  localField: "_id",
  foreignField: "fuel",
  justOne: true, // retorna objeto único, não array
  options: { sort: { version: -1 } }, // pega a de maior versão
});

export default mongoose.models.Fuel ||
  mongoose.model<IFuel>("Fuel", FuelSchema);
