import type { FuelPriceVersionDTO } from "./FuelPriceVersionDTO";

export interface FuelDTO {
  _id: string;
  name: string;
  unit: string;
  priceVersions?: (FuelPriceVersionDTO | string)[];
  currentPriceVersion?: FuelPriceVersionDTO | string;
  createdAt: string;
  updatedAt: string;
}
