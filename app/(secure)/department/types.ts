import { Boss, Department } from "@/app/types";
import { DepartmentValidator } from "./validator";
import * as z from "zod";

export type DepartmentFormData = z.infer<typeof DepartmentValidator>;

export type DepartmentProps = {
  defaultValues?: Department;
  bosses?: Boss[];
};
