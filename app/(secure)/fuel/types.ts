import type { FuelDTO } from "@/dto/FuelDTO";
import type z from "zod";
import type {
  FuelValidator,
  FuelPriceVersionValidator,
  CombinedFuelValidator,
} from "./validator";

export type FuelFormData = z.infer<typeof FuelValidator>;
export type FuelPriceVersionFormData = z.infer<
  typeof FuelPriceVersionValidator
>;
export type CombinedFuelFormData = z.infer<typeof CombinedFuelValidator>;

export interface FuelFormProps {
  defaultValues: FuelDTO | null;
  fuels: FuelDTO[];
}

export type FuelDetailParam = {
  fuel: FuelDTO;
};
