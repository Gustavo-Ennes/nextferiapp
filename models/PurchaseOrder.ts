import mongoose, { Schema, Document, Types } from "mongoose";
import type { IFuel } from "./Fuel";
import type { Department } from "./Department";

export interface IOrderItem {
  fuel: Types.ObjectId | IFuel;
  quantity: number;
  price: number;
}

export interface IPurchaseOrder extends Document {
  _id: Types.ObjectId;
  department: Types.ObjectId | Department;
  reference: string;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    fuel: {
      type: Schema.Types.ObjectId,
      ref: "Fuel",
      required: [true, "A fuel type is required."],
    },
    quantity: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    reference: { type: String, required: true, unique: true },
    items: [OrderItemSchema],
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "A department is required."],
    },
  },
  { timestamps: true },
);

export default mongoose.models.PurchaseOrder ||
  mongoose.model<IPurchaseOrder>("PurchaseOrder", PurchaseOrderSchema);
