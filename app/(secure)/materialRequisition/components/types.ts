import type { ReactNode } from "react";

export type AverageDepartmentTableParam = {
  weekStart: string;
  gas?: number;
  s10?: number;
  s500?: number;
  arla?: number;
};

export type MaterialRequisitionCardParam = {
  data: { total: string; selected?: string };
  icon: ReactNode;
  label?: string;
  color?: string;
  departmentName?: boolean;
};
