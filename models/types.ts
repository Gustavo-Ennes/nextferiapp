type FuelType = "gas" | "s500" | "s10" | "arla";
export type FuelTotals = Record<FuelType, number>;

export type FuellingSummaryVehicle = {
  vehicle: string;
  prefix: number;
  fuelType: FuelType;
  totalLiters: number;
  lastKm: number | null;
};

export type FuellingSummaryDepartment = {
  name: string;
  fuelTotals: FuelTotals;
  vehicles: FuellingSummaryVehicle[];
};
