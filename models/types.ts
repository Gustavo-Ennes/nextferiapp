import type { Types } from "mongoose";
import type { IFuel } from "./Fuel";
import type { Department } from "./Department";

export interface FuelingData {
  date: string;
  quantity: number;
  kmHr: number | null;
}

export type FuellingSummaryVehicle = {
  vehicle: string;
  prefix: number;
  fuel: Types.ObjectId | IFuel;
  totalLiters: number;
  totalValue: number;
  totalKmHr?: number;
  lastKm: number | null;
  fuelings?: FuelingData[];
};

export type FuellingSummaryDepartment = {
  department?: Types.ObjectId | Department;
  totalValue: number;
  name: string;
  vehicles: FuellingSummaryVehicle[];
};
