import type { FuelDTO } from "@/dto/FuelDTO";
import type { CombinedFuelFormData } from "./types";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";

export const prepareDefaults = (fuel: FuelDTO): CombinedFuelFormData => ({
  ...fuel,
  price: 0,
  version: (fuel?.currentPriceVersion as FuelPriceVersionDTO).version + 1,
});
