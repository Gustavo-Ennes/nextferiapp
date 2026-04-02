import type { PdfPreviewItem } from "@/context/types";
import type { DepartmentDTO } from "@/dto";
import type { FuelDTO } from "@/dto/FuelDTO";

export interface FuelingData {
  date: string;
  quantity: number;
  kmHr: number | null;
}

export interface CarEntry {
  vehicle: string;
  prefix: number;
  fuel: string | FuelDTO;
  fuelings: FuelingData[];
}

export interface TabData {
  department: string | DepartmentDTO;
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
