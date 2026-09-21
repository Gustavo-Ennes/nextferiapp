import type { FuelDTO, SupplierDTO, FuelPriceVersionDTO } from "@/dto";
import type { CombinedFuelFormData } from "./types";

export const prepareDefaults = (fuel: FuelDTO): CombinedFuelFormData => ({
  name: fuel.name,
  unit: fuel.unit,
  fuel: fuel._id,
  price: 0,
  supplier: (
    (fuel.currentPriceVersion as FuelPriceVersionDTO).supplier as SupplierDTO
  )._id,
  version: (fuel?.currentPriceVersion as FuelPriceVersionDTO).version + 1,
  currentPriceVersion: (fuel.currentPriceVersion as FuelPriceVersionDTO)._id,
});
