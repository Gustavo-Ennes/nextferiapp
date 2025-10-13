import type { Vacation, Worker } from "@/app/types";

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
  upcomingLeaves: Vacation[];
  upcomingReturns: Vacation[];
  onVacationToday: Worker[];
};
