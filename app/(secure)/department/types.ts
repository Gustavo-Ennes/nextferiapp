import { Boss, Department } from "@/app/types";

export type DepartmentFormData = {
  name: string;
  responsible: string;
};

export type DepartmentProps = {
  defaultValues?: Department;
  bosses?: Boss[];
};
