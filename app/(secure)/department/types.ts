import { DepartmentValidator } from "./validator";
import * as z from "zod";
import type { BossDTO, DepartmentDTO } from "@/dto";

export type DepartmentFormData = z.infer<typeof DepartmentValidator>;

export type DepartmentProps = {
  defaultValues?: DepartmentDTO;
  bosses?: BossDTO[];
};
