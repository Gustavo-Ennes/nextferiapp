import type { ReactNode } from "react";
import type {
  VehicleScatterSeries,
  VehicleConsumptionRow,
  LitersTrendSeries,
  FuelMixItem,
} from "../types";
import type {
  FuelDTO,
  FuelingBatchDTO,
  FuelingBatchDTODepartment,
  FuelingBatchDTOInvoice,
  FuelingBatchDTOVehicle,
  PurchaseOrderDTO,
} from "@/dto";

export type AverageDepartmentTableParam = {
  createdAt: string;
  [fuelName: string]: number | string;
};

export type FuelingBatchCardParam = {
  data: { total: string; selected?: string };
  icon: ReactNode;
  label?: string;
  color?: string;
  departmentName?: boolean;
};

export type AverageChartProps = {
  pieData: any[];
  fuelMix: FuelMixItem[];
  selectedDepartment: string;
  vehicleScatterSeries: VehicleScatterSeries[];
  efficiencyScatter: VehicleScatterSeries[];
  topConsumptionVehicles: VehicleConsumptionRow[];
  litersTrend: LitersTrendSeries[];
  dates: string[];
};

export type AverageHeaderProps = {
  rows: AverageDepartmentTableParam[];
  fuelingBatches: FuelingBatchDTO[];
};

export type TabFormProps = {
  onSubmitAction: (vehicle: FuelingBatchDTOVehicle) => Promise<void>;
  fuelingBatchDepartment: FuelingBatchDTODepartment;
  fuels: FuelDTO[];
};

export type FuelingBatchInvoicePanelProps = {
  fuelingBatchDepartment: FuelingBatchDTODepartment;
  onAddInvoiceAction: (invoice: FuelingBatchDTOInvoice) => void;
  onRemoveInvoiceAction: (invoiceNumber: number) => void;
  fuels: FuelDTO[];
  purchaseOrders: PurchaseOrderDTO[];
  fuelingBatchInvoices: FuelingBatchDTOInvoice[];
};

export type StatItem = {
  name: string;
  icon: ReactNode;
  label: string;
  total: string;
  selected?: string;
  type: "primary" | "secondary";
  textColor?: string;
};
