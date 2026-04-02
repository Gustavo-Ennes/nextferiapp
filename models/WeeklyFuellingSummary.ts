import mongoose, { Schema, model, Document, Types } from "mongoose";
import type { FuellingSummaryDepartment } from "./types";

const VehicleSummarySchema = new Schema(
  {
    vehicle: { type: String, required: true },
    prefix: { type: Number, required: true },
    fuel: {
      type: Schema.Types.ObjectId,
      ref: "Fuel",
      required: true,
    },
    totalLiters: { type: Number, required: true },
    totalValue: { type: Number, required: true, default: 0 },
    lastKm: { type: Number, required: false },
  },
  { _id: false },
);

const DepartmentSummarySchema = new Schema(
  {
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    name: { type: String, required: true },
    vehicles: {
      type: [VehicleSummarySchema],
      default: [],
    },
    totalValue: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

export interface WeeklyFuellingSummary extends Document {
  _id: Types.ObjectId;
  weekStart: Date;
  departments: FuellingSummaryDepartment[];
  createdAt: Date;
}

const WeeklyFuellingSummarySchema = new Schema(
  {
    weekStart: { type: Date, required: true, index: true, unique: true },
    departments: { type: [DepartmentSummarySchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "weeklySummaries",
    capped: { size: 1024 * 1024, max: 60 },
  },
);

export const WeeklyFuellingSummaryModel =
  mongoose.models.WeeklyFuellingSummary ||
  model<WeeklyFuellingSummary>(
    "WeeklyFuellingSummary",
    WeeklyFuellingSummarySchema,
  );
