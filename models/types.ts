type FuelType = "gas" | "s500" | "s10" | "arla";
export type FuelTotals = Record<FuelType, number>;

export type FuellingSummaryVehicle = {
  vehicle: string;
  prefix: number;
  fuelType: string;
  totalLiters: number;
  lastKm?: number;
};

export type FuellingSummaryDepartment = {
  name: string;

  fuelTotals: {
    gas: number;
    s10: number;
    s500: number;
    arla: number;
  };

  vehicles: FuellingSummaryVehicle[];
};
