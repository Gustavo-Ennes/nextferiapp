import type { ReactNode } from "react";

export type AverageDepartmentTableParam = {
  weekStart: string;
  [fuelName: string]: number | string;
};

export type MaterialRequisitionCardParam = {
  data: { total: string; selected?: string };
  icon: ReactNode;
  label?: string;
  color?: string;
  departmentName?: boolean;
};
