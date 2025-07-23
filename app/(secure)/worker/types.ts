import { Department, Worker } from "@/app/types";

export interface WorkerFormData {
  name: string;
  matriculation: string;
  registry: string;
  role: string;
  department: string | null;
  admissionDate: Date;
  justification?: string;
}

export interface WorkerProps {
  defaultValues?: Worker;
  departments: Department[];
}
