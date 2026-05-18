import type { DepartmentDTO } from "./DepartmentDTO";
import type { FuelDTO } from "./FuelDTO";

export type WeeklyFuellingSummaryVehicle = {
  vehicle: string;
  prefix: number;
  fuel?: FuelDTO | string;
  totalLiters: number;
  totalValue: number;
  totalKmHr?: number;
  lastKm: number | null;
};

export type WeeklyFuellingSummaryDepartment = {
  department?: DepartmentDTO | string;
  totalValue: number;
  name: string;
  vehicles: WeeklyFuellingSummaryVehicle[];
};

export interface WeeklyFuellingSummaryDTO {
  _id: string;
  weekStart: string; // ISO
  createdAt: string; // ISO
  departments: WeeklyFuellingSummaryDepartment[];
}
