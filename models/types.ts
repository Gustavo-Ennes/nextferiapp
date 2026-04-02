import type { Types } from "mongoose";
import type { IFuel } from "./Fuel";

export type FuellingSummaryVehicle = {
  vehicle: string;
  prefix: number;
  fuel: Types.ObjectId | IFuel;
  totalLiters: number;
  totalValue: number;
  lastKm: number | null;
};

export type FuellingSummaryDepartment = {
  department?: Types.ObjectId | string;
  totalValue: number;
  name: string;
  vehicles: FuellingSummaryVehicle[];
};
