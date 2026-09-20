import type {
  DepartmentDTO,
  FuelingBatchDTO,
  VacationDTO,
  WorkerDTO,
  FuelDTO,
  PurchaseOrderDTO,
} from "@/dto";

export type CardParam = {
  label: string;
  quantity?: number;
  lines?: {
    primary: string;
    secondary: string;
  }[];
  icon?: React.ReactNode;
  details?: string[];
};

export type DashboardData = {
  totalWorkers: number;
  totalDepartments: number;
  upcomingLeaves: VacationDTO[];
  upcomingReturns: VacationDTO[];
  onVacationToday: WorkerDTO[];
};

export type SplitPurchaseOrderByValidFuelVersionReturn = {
  valid: PurchaseOrderDTO[];
  invalid: PurchaseOrderDTO[];
  partialInvalid: PurchaseOrderDTO[];
};
export type SplitPurchaseOrderByValidFuelVersionParam = {
  purchaseOrders: PurchaseOrderDTO[];
  fuels: FuelDTO[];
};

export type DashboardParam = {
  vacations: VacationDTO[];
  departments: DepartmentDTO[];
  workers: WorkerDTO[];
  onVacationToday: WorkerDTO[];
  returningToday: VacationDTO[];
  upcomingLeaves: VacationDTO[];
  upcomingReturns: VacationDTO[];
  workersByRole: Partial<Record<string, WorkerDTO[]>>;
  purchaseOrders: SplitPurchaseOrderByValidFuelVersionReturn;
  fuels: FuelDTO[];
  fuelingBatches: FuelingBatchDTO[];
};

export type GetWorkerByStatusReturn = {
  activeWorkers: number;
  inactiveWorkers: number;
  externalWorkers: number;
  internalWorkers: number;
};

export type GetVacationDetailsParam = {
  onVacationToday: WorkerDTO[];
  returningToday: VacationDTO[];
  vacations: VacationDTO[];
  upcomingLeaves: VacationDTO[];
  upcomingReturns: VacationDTO[];
};

export type GetVacationDetailsReturn = {
  onVacationDetails: string[];
  returningDetails: string[];
  upcomingLeavesLines: { primary: string; secondary: string }[];
  upcomingReturnsLines: { primary: string; secondary: string }[];
};
