import mongoose, { Schema, Document, Types } from "mongoose";
import {
  type FuelType,
  fuelTypes,
} from "@/lib/repository/weeklyFuellingSummary/types";

export interface IOrderItem {
  fuel: FuelType;
  quantity: number;
  price: number;
}

export interface IPurchaseOrder extends Document {
  _id: Types.ObjectId;
  reference: string;
  items: IOrderItem[];
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    fuel: { type: String, enum: fuelTypes, required: true },
    quantity: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    reference: { type: String, required: true, unique: true },
    items: [OrderItemSchema],
  },
  { timestamps: true },
);

export default mongoose.models.PurchaseOrder ||
  mongoose.model<IPurchaseOrder>("PurchaseOrder", PurchaseOrderSchema);
