import type {
  FuelDTO,
  DepartmentDTO,
  FuelingBatchDTO,
  FuelingBatchDTODepartment,
  FuelingBatchDTOVehicle,
  PurchaseOrderDTO,
  FuelingBatchDTOInvoice,
} from "@/dto";

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
  dateLabel: string;
  date: string;
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
  fuelingBatches: FuelingBatchDTO[];
  selectedDepartment?: string;
  selectedDate?: string;
};

export type FuelingBatchFormProps = {
  fuelingBatch: FuelingBatchDTO | null;
  fuels: FuelDTO[];
  departments: DepartmentDTO[];
  purchaseOrders: PurchaseOrderDTO[];
};

export type CardsGridProps = {
  fuelingBatchDepartment: FuelingBatchDTODepartment;
  onRemoveAction: (prefix: number) => void;
  onEditAction: (vehicle: FuelingBatchDTOVehicle) => void;
};

export type FuelingBatchTabProps = {
  fuelingBatchDepartment: FuelingBatchDTODepartment;
  onDataChangeAction: (
    updatedFuelingBatchDepartment: FuelingBatchDTODepartment,
  ) => Promise<void>;
  fuels: FuelDTO[];
  purchaseOrders: PurchaseOrderDTO[];
  fuelingBatchInvoices: FuelingBatchDTOInvoice[];
};

export type OnTabsDataChangeParam = {
  modifiedDepartment: FuelingBatchDTODepartment;
  remove?: boolean;
};

export type AverageHeaderProps = {
  departments: DepartmentDTO[];
  selectedDept: string;
  selectedDate: string;
  onChange: (d: string, w: string) => void;
  dates: Date[];
};

export type TabPanelProps = {
  children?: React.ReactNode;
  index: string;
  value: string;
};

export type DepartmentAccordionProps = {
  department: FuelingBatchDTODepartment;
  expanded: boolean;
  onToggle: () => void;
};
