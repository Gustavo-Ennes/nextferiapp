type FuelType = "gas" | "s500" | "s10" | "arla";
export type FuelTotals = Record<FuelType, number>;

export type FuellingSummaryVehicle = {
  vehicle: string;
  prefix: number;
  fuelType: FuelType;
  totalLiters: number;
  lastKm?: number;
};

export type FuellingSummaryDepartment = {
  name: string;
  fuelTotals: FuelTotals;
  vehicles: FuellingSummaryVehicle[];
};

export interface WeeklyFuellingSummary {
  _id: string;
  weekStart: string;
  departments: FuellingSummaryDepartment[];
  createdAt: string;
}
