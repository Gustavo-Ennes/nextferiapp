import type { DepartmentDTO, VacationDTO, WorkerDTO } from "@/dto";

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

export type DashboardParam = {
  vacations: VacationDTO[];
  departments: DepartmentDTO[];
  workers: WorkerDTO[];
  onVacationToday: WorkerDTO[];
  returningToday: VacationDTO[];
  upcomingLeaves: VacationDTO[];
  upcomingReturns: VacationDTO[];
  workersByRole: Partial<Record<string, WorkerDTO[]>>;
};
