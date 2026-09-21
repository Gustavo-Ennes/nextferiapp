import type {
  FuelingBatchFueling,
  FuelingBatchPartials,
  FuelingBatchTotals,
  TotalFuels,
} from "@/models/types";
import type { DepartmentDTO } from "./DepartmentDTO";
import type { FuelDTO } from "./FuelDTO";
import type { PurchaseOrderDTO } from "./PurchaseOrderDTO";
import type { FuelPriceVersionDTO } from "./FuelPriceVersionDTO";

export type FuelingBatchDTOInvoiceItem = {
  fuel: FuelDTO | string;
  fuelPriceVersion: FuelPriceVersionDTO | string;
  quantity: number;
  total: number;
};

export type FuelingBatchDTOInvoice = {
  purchaseOrder: PurchaseOrderDTO | string;
  department: DepartmentDTO | string;
  number: number;
  series?: string;
  total: number;
  items: FuelingBatchDTOInvoiceItem[];
};

export type FuelingBatchDTOVehicle = {
  vehicle: string;
  prefix: number;
  fuel: FuelDTO | string | null;
  totals: FuelingBatchPartials;
  lastKm: number | null;
  fuelings?: FuelingBatchFueling[];
};

export type FuelingBatchDTODepartment = {
  department?: DepartmentDTO | string;
  totals: FuelingBatchTotals;
  name: string;
  vehicles: FuelingBatchDTOVehicle[];
  invoices: FuelingBatchDTOInvoice[];
};

export interface FuelingBatchDTO {
  _id: string;
  createdAt: string;
  updatedAt?: string;
  observation?: string;
  totals: FuelingBatchTotals;
  departments: FuelingBatchDTODepartment[];
}

export interface FuelingBatchTableLine {
  _id: string;
  createdAt: string;
  updatedAt?: string;
  observation?: string;
  totalFuels: TotalFuels;
  totalValue: number;
  totalKmHrs: number;
  totalVehicles: number;
  totalFuelings: number;
  totalDepartments: number;
  totalInvoices: number;
  totalInvoicesValue: number;
}
