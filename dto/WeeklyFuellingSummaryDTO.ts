export interface WeeklyFuellingSummaryDTO {
  _id: string;
  weekStart: string; // ISO
  createdAt: string; // ISO
  departments: {
    name: string;
    fuelTotals: {
      gas: number;
      s10: number;
      s500: number;
      arla: number;
    };
    vehicles: {
      vehicle: string;
      prefix: number;
      fuelType: string;
      totalLiters: number;
      lastKm?: number;
    }[];
  }[];
}
