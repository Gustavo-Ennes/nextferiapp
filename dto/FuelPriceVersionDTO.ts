import type { FuelDTO } from "./FuelDTO";
import type { SupplierDTO } from "./SupplierDTO";

export interface FuelPriceVersionDTO {
  _id: string;
  fuel: string | FuelDTO;
  supplier: string | SupplierDTO;
  version: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}
