import mongoose, { Schema, model, Document, Types } from "mongoose";
import type {
  FuelingBatchDepartment,
  FuelingBatchInvoice,
  FuelingBatchTotals,
  FuelInfo,
} from "./types";

const FuelingBatchInvoiceItemSchema = new Schema<
  FuelingBatchInvoice["items"][0]
>({
  fuel: {
    type: Types.ObjectId,
    ref: "Fuel",
    required: true,
  },
  fuelPriceVersion: {
    type: Types.ObjectId,
    ref: "FuelPriceVersion",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const FuelingBatchInvoiceSchema = new Schema<FuelingBatchInvoice>({
  purchaseOrder: {
    type: Types.ObjectId,
    ref: "PurchaseOrder",
    required: true,
  },
  department: {
    type: Types.ObjectId,
    ref: "Department",
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
  series: {
    type: String,
    required: false,
  },
  total: {
    type: Number,
    required: true,
  },
  items: {
    type: [FuelingBatchInvoiceItemSchema],
    default: [],
  },
});

const FuelingBatchFuelInfoSchema = new Schema<FuelInfo>(
  {
    value: { type: Number, required: true },
    liters: { type: Number, required: true },
  },
  { _id: false },
);

const FuelingBatchFuelPartialsSchema = new Schema(
  {
    totalValue: { type: Number, required: true, default: 0 },
    totalKmHrs: { type: Number, required: false, default: 0 },
    totalLiters: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const FuelingBatchTotalsSchema = new Schema<FuelingBatchTotals>(
  {
    totalValue: { type: Number, required: true, default: 0 },
    totalFuels: {
      type: Map,
      of: FuelingBatchFuelInfoSchema,
    },
    totalKmHrs: { type: Number, required: true, default: 0 },
    totalFuelings: { type: Number, required: true, default: 0 },
    totalVehicles: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const FuelingBatchFuelingSchema = new Schema(
  {
    date: { type: String, required: true },
    quantity: { type: Number, required: true },
    kmHr: { type: Number, required: false },
  },
  { _id: false },
);

const FuelingBatchVehicleSchema = new Schema(
  {
    vehicle: { type: String, required: true },
    prefix: { type: Number, required: true },
    fuel: {
      type: Schema.Types.ObjectId,
      ref: "Fuel",
      required: true,
    },
    totals: {
      type: FuelingBatchFuelPartialsSchema,
      required: true,
      default: {
        totalValue: 0,
        totalKmHrs: 0,
        totalLiters: 0,
      },
    },
    lastKm: { type: Number, required: false },
    fuelings: { type: [FuelingBatchFuelingSchema], default: [] },
  },
  { _id: false },
);

const FuelingBatchDepartmentSchema = new Schema(
  {
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    name: { type: String, required: true },
    vehicles: {
      type: [FuelingBatchVehicleSchema],
      default: [],
    },
    invoices: {
      type: [FuelingBatchInvoiceSchema],
      default: [],
    },
    totals: {
      type: FuelingBatchTotalsSchema,
      required: true,
      default: {
        totalFuelings: 0,
        totalVehicles: 0,
        totalValue: 0,
        totalKmHrs: 0,
        totalFuels: {},
      },
    },
  },
  { _id: false },
);

export interface FuelingBatch extends Document {
  _id: Types.ObjectId;
  departments: FuelingBatchDepartment[];
  observation?: string;
  totals: FuelingBatchTotals;
  createdAt: Date;
  updatedAt: Date;
}

const FuelingBatchSchema = new Schema<FuelingBatch>(
  {
    departments: { type: [FuelingBatchDepartmentSchema], default: [] },
    observation: { type: String, required: false },
    totals: {
      type: FuelingBatchTotalsSchema,
      required: true,
      default: {
        totalFuelings: 0,
        totalVehicles: 0,
        totalValue: 0,
        totalKmHrs: 0,
        totalFuels: {},
      },
    },
  },
  {
    collection: "fuelingBatches",
    timestamps: true,
  },
);

export const FuelingBatchModel =
  mongoose.models.FuelingBatch ||
  model<FuelingBatch>("FuelingBatch", FuelingBatchSchema);
