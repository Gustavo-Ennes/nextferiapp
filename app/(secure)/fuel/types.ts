import type { FuelDTO } from "@/dto/FuelDTO";
import type z from "zod";
import type { FuelValidator } from "./validator";

export type FuelFormData = z.infer<typeof FuelValidator>;

export interface FuelFormProps {
  defaultValues: FuelDTO | null;
}
