import mongoose, { Schema, model, Document, Types } from "mongoose";
import type { FuellingSummaryDepartment } from "./types";

const VehicleSummarySchema = new Schema(
  {
    vehicle: { type: String, required: true },
    prefix: { type: Number, required: true },
    totalLiters: { type: Number, required: true },
    lastKm: { type: Number, required: false },
  },
  { _id: false }
);

const DepartmentSummarySchema = new Schema(
  {
    name: { type: String, required: true },

    fuelTotals: {
      gas: { type: Number, default: 0 },
      s10: { type: Number, default: 0 },
      s500: { type: Number, default: 0 },
      arla: { type: Number, default: 0 },
    },

    vehicles: {
      type: [VehicleSummarySchema],
      default: [],
    },
  },
  { _id: false }
);

export interface WeeklyFuellingSummary extends Document {
  _id: Types.ObjectId;
  weekStart: Date;
  departments: FuellingSummaryDepartment[];
  createdAt: Date;
}

const WeeklyFuellingSummarySchema = new Schema(
  {
    weekStart: { type: Date, required: true, index: true },
    departments: { type: [DepartmentSummarySchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "weeklySummaries",
    capped: { size: 1024 * 1024, max: 60 },
  }
);

export const WeeklyFuellingSummaryModel =
  mongoose.models.FuellingWeeklySummary ||
  model<WeeklyFuellingSummary>(
    "WeeklyFuellingSummary",
    WeeklyFuellingSummarySchema
  );
