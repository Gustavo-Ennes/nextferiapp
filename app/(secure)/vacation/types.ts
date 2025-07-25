import { Worker, Boss, Vacation } from "@/app/types";

export type VacationType = "normal" | "license" | "dayOff" | "vacation";

export interface VacationFormData {
  worker: string | null;
  boss: string | null;
  startDate: Date;
  type: VacationType;
  duration: number; // em dias
  period?: "half" | "full"; // para dayOff
  observation?: string;
}

export interface VacationProps {
  workers: Worker[];
  bosses: Boss[];
  defaultValues?: Vacation;
  id?: string;
  type?: VacationType;
}
