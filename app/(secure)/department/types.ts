import { DepartmentValidator } from "@/lib/validators/department";
import * as z from "zod";
import type { BossDTO, DepartmentDTO } from "@/dto";

export type DepartmentFormData = z.infer<typeof DepartmentValidator>;

export type DepartmentProps = {
  defaultValues: DepartmentDTO | null;
  bosses?: BossDTO[];
};
