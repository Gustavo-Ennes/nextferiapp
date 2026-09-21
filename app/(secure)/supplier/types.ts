import type z from "zod";
import type { SupplierValidator } from "@/lib/validators/supplier";

export type SupplierFormData = z.infer<typeof SupplierValidator>;
