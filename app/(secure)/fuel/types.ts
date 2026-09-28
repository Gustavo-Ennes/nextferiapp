import type { FuelDTO } from "@/dto/FuelDTO";
import type z from "zod";
import type {
  FuelValidator,
  FuelPriceVersionValidator,
  CombinedFuelValidator,
  FuelValidatorUpdate,
} from "@/lib/validators/fuel";
import type { SupplierDTO } from "@/dto";

export type FuelFormData = z.infer<typeof FuelValidator>;
export type FuelFormDataUpdate = z.infer<typeof FuelValidatorUpdate>;
export type FuelPriceVersionFormData = z.infer<
  typeof FuelPriceVersionValidator
>;
export type CombinedFuelFormData = z.infer<typeof CombinedFuelValidator>;

export interface FuelFormProps {
  defaultValues: FuelDTO | null;
  fuels: FuelDTO[];
  suppliers: SupplierDTO[]
}

export type FuelDetailParam = {
  fuel: FuelDTO;
};
