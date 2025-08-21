export type FuelType = "gas" | "s500" | "s10" | "arla";

export interface FuelingData {
  id: number;
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
  department?: string;
  carEntries?: CarEntry[];
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface LocalStorageData {
  data: TabData[];
  activeTab: number;
}
