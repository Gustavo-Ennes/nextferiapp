import type { Types } from "mongoose";
import type { IFuel } from "./Fuel";
import type { DepartmentDTO } from "@/dto/DepartmentDTO";
import type { FuelDTO } from "@/dto/FuelDTO";

export type FuellingSummaryVehicle = {
  vehicle: string;
  prefix: number;
  fuel: Types.ObjectId | IFuel | FuelDTO;
  totalLiters: number;
  totalValue: number;
  totalKmHr?: number;
  lastKm: number | null;
};

export type FuellingSummaryDepartment = {
  department?: Types.ObjectId | string | DepartmentDTO;
  totalValue: number;
  name: string;
  vehicles: FuellingSummaryVehicle[];
};
