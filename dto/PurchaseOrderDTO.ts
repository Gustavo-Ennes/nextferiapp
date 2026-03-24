import type { DepartmentDTO } from "./DepartmentDTO";
import type { FuelDTO } from "./FuelDTO";
import type { FuelPriceVersionDTO } from "./FuelPriceVersionDTO";

export interface PurchaseOrderItemDTO {
  fuel: FuelDTO | string;
  fuelPriceVersion: FuelPriceVersionDTO | string;
  quantity: number;
  price: number;
}

export interface PurchaseOrderDTO {
  _id: string;
  reference: string;
  department: DepartmentDTO | string;
  items: PurchaseOrderItemDTO[];
  total: number;
  createdAt: string;
  updatedAt: string;
}
