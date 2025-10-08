import type { Department, Worker } from "@/app/types";
import * as z from "zod";
import { WorkerValidator } from "./validator";
import type { ReactNode } from "react";

export type WorkerFormData = z.infer<typeof WorkerValidator>;

export interface WorkerProps {
  defaultValues?: Worker;
  departments: Department[];
}

export type WorkerFormProp =
  | "name"
  | "role"
  | "registry"
  | "matriculation"
  | "justification";

export type MinMaxStringMessageParam = {
  prop: WorkerFormProp;
  condition: "min" | "max";
};

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
