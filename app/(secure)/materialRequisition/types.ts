import type { WeeklyFuellingSummaryDTO } from "@/dto/WeeklyFuellingSummaryDTO";

export interface DepartmentConsumptionRow {
  department: string;
  totalValue: number;
  totalLiters: number;
  totalKmHr?: number;
}

export interface FuelMixItem {
  id: string;
  value: number; // total liters
  label: string;
}

export interface VehicleConsumptionRow {
  prefix: string;
  totalLiters: number;
  totalValue: number;
}

export interface VehicleScatterPoint {
  x: number; // totalLiters
  y: number; // totalValue
  id: string; // prefix
  fuel: string; // fuel type
}

export interface VehicleScatterSeries {
  label: string; // department name
  data: VehicleScatterPoint[];
}

export interface DepartmentScatterSeries {
  label: string; // "Todos os Departamentos" — série única
  data: { x: number; y: number; id: string }[];
}
export interface ScatterTooltipProps {
  series: { label: string; data: { id: string; x: number; y: number }[] }[];
  labels?: {
    id?: string; // default: "ID"
    x?: string; // default: "X"
    y?: string; // default: "Y"
    series?: string; // default: "Série" — omitido se só há uma série
  };
}
export interface LitersTrendPoint {
  week: string;
  weekStart: string;
  totalLiters: number;
}

export interface LitersTrendSeries {
  label: string;
  data: LitersTrendPoint[];
}

export type PieData = {
  id: string;
  label: string;
  value: number;
};

export type GraphUtilFnParam = {
  summaries: WeeklyFuellingSummaryDTO[];
  selectedDepartment?: string;
  selectedWeek?: string;
};
