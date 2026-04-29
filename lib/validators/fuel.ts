import z from "zod";
import { ObjectIdString } from "./utils";

export const FuelValidator = z.object({
  name: z.string().min(3, "Mínino de 3 caracteres para nome do combustível."),
  unit: z.string("Uma unidade de medida é esperada"),
  currentPriceVersion: z.optional(ObjectIdString),
});

export const FuelValidatorUpdate = z.object({
  name: z.optional(
    z.string().min(3, "Mínino de 3 caracteres para nome do combustível."),
  ),
  unit: z.optional(z.string("Uma unidade de medida é esperada")),
  currentPriceVersion: z.optional(ObjectIdString),
});

export const FuelPriceVersionValidator = z.object({
  fuel: z.optional(ObjectIdString),
  price: z.number().gt(0, "O preço deve ser maior que zero."),
  version: z.number().min(1),
});

export const FuelPriceVersionValidatorUpdate = z.object({
  fuel: z.optional(ObjectIdString),
  price: z.optional(z.number().gt(0, "O preço deve ser maior que zero.")),
  // don't want to change version
});

export const CombinedFuelValidator = FuelValidator.extend(
  FuelPriceVersionValidator.shape,
);
