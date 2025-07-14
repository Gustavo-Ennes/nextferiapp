export type VacationType = "normal" | "license" | "dayOff";

export interface VacationFormData {
  workerId: string;
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
