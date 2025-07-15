import { Worker } from "@/app/types";

export type VacationType = "normal" | "license" | "dayOff";

export interface VacationFormData {
  worker: Worker | null;
  startDate: Date;
  type: VacationType;
  duration: number; // em dias
  period?: "half" | "full"; // para dayOff
  observation?: string;
}

export interface VacationProps {
  defaultValues?: VacationFormData;
  onSubmit: (data: VacationFormData) => void;
  isSubmitting?: boolean;
}
