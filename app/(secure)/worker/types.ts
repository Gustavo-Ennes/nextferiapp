import { Department } from "@/app/types";

export interface WorkerFormData {
  name: string;
  matriculation: string;
  role: string;
  department: Department | null;
}

export interface WorkerProps {
  defaultValues?: WorkerFormData;
  onSubmit: (data: WorkerFormData) => void;
  isSubmitting?: boolean;
}
