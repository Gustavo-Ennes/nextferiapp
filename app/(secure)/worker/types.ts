import * as z from "zod";
import { WorkerValidator } from "@/lib/validators/worker";
import type { ReactNode } from "react";
import type { DepartmentDTO, WorkerDTO } from "@/dto";

export type WorkerFormData = z.infer<typeof WorkerValidator>;
export interface WorkerProps {
  defaultValues: WorkerDTO | null;
  departments: DepartmentDTO[];
}

export type WorkerStatus =
  | "active"
  | "onVacation"
  | "onLicense"
  | "onDayOff"
  | "retired";

export type TranslatedWorkerStatus =
  | "ativo"
  | "férias"
  | "licença"
  | "abonando"
  | "desligado";

export type WorkerStatusInfo = {
  name: string;
  icon: ReactNode;
  tooltipContent: string;
  badgeContent?: string;
};
