import type { DepartmentDTO } from "./DepartmentDTO";
import type { FuelDTO } from "./FuelDTO";

export interface PurchaseOrderItemDTO {
  fuel: FuelDTO | string;
  quantity: number;
  price: number;
}

export interface PurchaseOrderDTO {
  _id: string;
  reference: string;
  department: DepartmentDTO | string;
  items: PurchaseOrderItemDTO[];
  createdAt: string;
  updatedAt: string;
}
