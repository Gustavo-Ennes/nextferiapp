import type { DepartmentDTO } from "./DepartmentDTO";
import type { FuelDTO } from "./FuelDTO";
import type { FuelPriceVersionDTO } from "./FuelPriceVersionDTO";
import type { SupplierDTO } from "./SupplierDTO";

export interface PurchaseOrderItemDTO {
  fuel: FuelDTO | string;
  fuelPriceVersion: FuelPriceVersionDTO | string;
  quantity: number;
  price: number;
  outdated: boolean;
  lowBalance: boolean;
}

export interface PurchaseOrderDTO {
  _id: string;
  reference: string;
  department: DepartmentDTO | string;
  supplier: SupplierDTO | string;
  items: PurchaseOrderItemDTO[];
  total: number;
  outdated: "all" | "some" | "none";
  lowBalance: "all" | "some" | "none";
  createdAt: string;
  updatedAt: string;
}
