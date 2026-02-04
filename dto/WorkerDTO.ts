import type { DepartmentDTO } from "./DepartmentDTO";

export type WorkerDTO = {
  _id: string;
  name: string;
  role: string;
  registry: string;
  matriculation: string;
  admissionDate: string;
  department?: DepartmentDTO | string;
  justification?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isExternal?: boolean;
};
