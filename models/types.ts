import type { Types } from "mongoose";
import type { IFuel } from "./Fuel";
import type { Department as IDepartment } from "./Department";
import type { IPurchaseOrder } from "./PurchaseOrder";
import type { IFuelPriceVersion } from "./FuelPriceVersion";

export interface FuelingBatchInvoiceItem {
  fuel: Types.ObjectId | IFuel;
  fuelPriceVersion: Types.ObjectId | IFuelPriceVersion;
  quantity: number;
  total: number;
}

export interface FuelingBatchInvoice {
  purchaseOrder: Types.ObjectId | IPurchaseOrder;
  department: Types.ObjectId | IDepartment;
  number: number;
  series?: string;
  total: number;
  items: FuelingBatchInvoiceItem[];
}

export interface FuelingBatchPartials {
  totalValue: number;
  totalKmHrs?: number;
  totalLiters: number;
}

export interface FuelingBatchTotals {
  totalValue: number;
  totalFuels: TotalFuels;
  totalKmHrs: number;
  totalFuelings: number;
  totalVehicles: number;
}

export interface FuelingBatchFueling {
  date: string;
  quantity: number;
  kmHr: number | null;
}

export type FuelingBatchVehicle = {
  vehicle: string;
  prefix: number;
  fuel: Types.ObjectId | IFuel;
  totals: FuelingBatchPartials;
  lastKm: number | null;
  fuelings?: FuelingBatchFueling[];
};

export type FuelingBatchDepartment = {
  department?: Types.ObjectId | IDepartment;
  totals: FuelingBatchTotals;
  name: string;
  vehicles: FuelingBatchVehicle[];
  invoices: FuelingBatchInvoice[];
};

export type TotalFuels = {
  [key: string]: FuelInfo;
};

export type FuelInfo = {
  liters: number;
  value: number;
};
