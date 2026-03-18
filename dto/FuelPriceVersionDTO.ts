import type { FuelDTO } from "./FuelDTO";

export interface FuelPriceVersionDTO {
  _id: string;
  fuel: string | FuelDTO;
  version: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}
