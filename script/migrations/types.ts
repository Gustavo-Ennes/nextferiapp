import type { Types } from "mongoose";

export type FuelTotals = {
  gas?: number;
  s10?: number;
  s500?: number;
  arla?: number;
};

export interface OldVehicle {
  vehicle: string;
  prefix: number;
  totalLiters: number;
  totalValue?: number;
  totalKmHr?: number;
  lastKm?: number;
  fuel?: Types.ObjectId; // já migrado
}

export interface OldDepartment {
  name: string;
  fuelTotals?: FuelTotals;
  vehicles: OldVehicle[];
  totalValue?: number;
}

export interface OldSummary {
  _id: Types.ObjectId;
  weekStart: Date;
  departments: OldDepartment[];
}

export interface RefDoc {
  _id: Types.ObjectId;
  name: string;
}
