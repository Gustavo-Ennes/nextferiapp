import type {
  DepartmentDTO,
  VacationDTO,
  WeeklyFuellingSummaryDTO,
  WorkerDTO,
} from "@/dto";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";

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
  weeklyFuellingSummaries: WeeklyFuellingSummaryDTO[];
};

export type GetWorkerByStatusReturn = {
  activeWorkers: number;
  inactiveWorkers: number;
  externalWorkers: number;
  internalWorkers: number;
};

export type WeeklyFuellingSummariesTotals = {
  totalWeeks: number;
  totalDepartments: number;
  totalVehicles: number;
  totalValue: number;
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
