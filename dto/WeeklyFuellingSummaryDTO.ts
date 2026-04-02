import type { DepartmentDTO } from "./DepartmentDTO";
import type { FuelDTO } from "./FuelDTO";

export interface WeeklyFuellingSummaryDTO {
  _id: string;
  weekStart: string; // ISO
  createdAt: string; // ISO
  departments: {
    department: DepartmentDTO | string;
    totalValue: number;
    name: string;
    vehicles: {
      vehicle: string;
      prefix: number;
      fuel: FuelDTO | string;
      totalLiters: number;
      totalValue: number;
      lastKm: number | null;
    }[];
  }[];
}
