import type z from "zod";
import type { PurchaseOrderValidator } from "./validator";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";

export type PurchaseOrderFormData = z.infer<typeof PurchaseOrderValidator>;

export type PurchaseFormProps = {
  defaultValues: PurchaseOrderDTO | null;
};
