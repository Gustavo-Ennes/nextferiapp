import type { PdfPreviewItem } from "@/context/types";

export type FuelType = "gas" | "s500" | "s10" | "arla";
export const fuelTypes = ["gas", "s500", "s10", "arla"] as const;

export interface FuelingData {
  date: string;
  quantity: number;
  kmHr: number | null;
}

export interface CarEntry {
  vehicle: string;
  prefix: number;
  fuel: FuelType;
  fuelings: FuelingData[];
}

export interface TabData {
  department: string;
  carEntries: CarEntry[];
  order: number;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface PdfData {
  items: PdfPreviewItem[];
  opened: boolean;
}

export interface LocalStorageData {
  data: TabData[];
  activeTab: number;
  pdfData: PdfData;
  lastPage?: string;
}
