import type { PdfPreviewItem } from "@/context/types";
import type { Types } from "mongoose";

export type FuelType = "gas" | "s500" | "s10" | "arla";

export interface FuelingData {
  date: Date;
  quantity: number;
  kmHr?: number;
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
  weeklySummaryId?: Types.ObjectId | string;
  data: TabData[];
  activeTab: number;
  pdfData: PdfData;
  lastPage?: string;
}

export interface DialogData {
  message: string;
  title: string;
  onConfirm: () => void;
}
