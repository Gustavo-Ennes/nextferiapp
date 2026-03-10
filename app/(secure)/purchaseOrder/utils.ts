import type { FuelType } from "@/lib/repository/weeklyFuellingSummary/types";

export const translateFuelType = (fuelType: FuelType): string => {
  switch (fuelType) {
    case "arla":
      return "Arla";
    case "gas":
      return "Gasolina";
    case "s10":
      return "Diesel S10";
    case "s500":
      return "Diesel S500";
  }
};

export const purchaseOrderBaseline = {
  reference: "",
  items: []
}
