import type { DepartmentDTO } from "@/dto";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
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
  department: "",
  items: [],
};

export const prepareDefaults = (purchaseOrder: PurchaseOrderDTO) => ({
  ...purchaseOrder,
  department: (purchaseOrder.department as DepartmentDTO)._id,
  items: purchaseOrder.items.map((item) => ({
    ...item,
    fuel: (item.fuel as FuelDTO)._id,
    fuelPriceVersion: (item.fuelPriceVersion as FuelPriceVersionDTO)._id,
  })),
});
