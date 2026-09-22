import mongoose, { Schema, Document, Types } from "mongoose";
import type { IFuel } from "./Fuel";
import type { Department } from "./Department";
import type { IFuelPriceVersion } from "./FuelPriceVersion";
import type { ISupplier } from "./Supplier";

export interface IOrderItem {
  fuel: Types.ObjectId | IFuel;
  fuelPriceVersion: Types.ObjectId | IFuelPriceVersion;
  quantity: number;
  price: number;
  outdated: boolean;
  lowBalance: boolean;
}

export interface IPurchaseOrder extends Document {
  _id: Types.ObjectId;
  department: Types.ObjectId | Department;
  supplier: Types.ObjectId | ISupplier;
  reference: string;
  items: IOrderItem[];
  total: number;
  outdated: "all" | "some" | "none";
  lowBalance: "all" | "some" | "none";
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
    fuelPriceVersion: {
      type: Schema.Types.ObjectId,
      ref: "FuelPriceVersion",
      required: [true, "A fuel price version is required."],
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
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "A supplier is required."],
    },
    total: { type: Number, required: true },
  },
  { timestamps: true },
);

const isItemOutdated = (purchaseOrderItem: IOrderItem): boolean => {
  return (
    (
      (purchaseOrderItem.fuel as IFuel).currentPriceVersion as IFuelPriceVersion
    )._id.toString() !== purchaseOrderItem.fuelPriceVersion._id.toString()
  );
};

OrderItemSchema.virtual("outdated").get(function () {
  return isItemOutdated(this);
});
OrderItemSchema.virtual("lowBalance").get(function () {
  return this.quantity < 5;
});

PurchaseOrderSchema.virtual("outdated").get(function () {
  return this.items.every(isItemOutdated)
    ? "all"
    : this.items.some(isItemOutdated)
      ? "some"
      : "none";
});
PurchaseOrderSchema.virtual("lowBalance").get(function () {
  return this.items.every((i) => i.quantity < 5)
    ? "all"
    : this.items.some((i) => i.quantity < 5)
      ? "some"
      : "none";
});

export default mongoose.models.PurchaseOrder ||
  mongoose.model<IPurchaseOrder>("PurchaseOrder", PurchaseOrderSchema);
