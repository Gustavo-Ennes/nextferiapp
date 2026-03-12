import type z from "zod";
import type { PurchaseOrderValidator } from "./validator";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import type { DepartmentDTO } from "@/dto";
import type { FuelDTO } from "@/dto/FuelDTO";

export type PurchaseOrderFormData = z.infer<typeof PurchaseOrderValidator>;

export type PurchaseFormProps = {
  defaultValues: PurchaseOrderDTO | null;
  departments: DepartmentDTO[];
  fuels: FuelDTO[];
};
