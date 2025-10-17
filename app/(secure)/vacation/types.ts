import type { Worker, Boss, Vacation } from "@/app/types";
import * as z from "zod";
import { VacationValidator } from "./validator";

export type VacationType = "normal" | "license" | "dayOff";
export type VacationTypeParam = "normal" | "license" | "dayOff" | "all";
export type VacationPeriod = "half" | "full";
export type VacationFormData = z.infer<typeof VacationValidator>;
export type VacationDuration = 0.5 | 1 | 15 | 30 | 45 | 60 | 75 | 90;

export interface VacationProps {
  workers: Worker[];
  bosses: Boss[];
  defaultValues?: Vacation;
  id?: string;
  type: VacationType;
  isReschedule?: boolean;
}
