import z from "zod";
import { ObjectIdString } from "./utils";

export const FuelValidator = z.object({
  name: z
    .string("O combustível precisa de um nome.")
    .min(3, "Mínino de 3 caracteres para nome do combustível."),
  unit: z.string("Uma unidade de medida é esperada."),
  currentPriceVersion: z.optional(ObjectIdString),
});

export const FuelValidatorUpdate = z.object({
  name: z.optional(
    z.string("O nome só pode conter letras.").min(3, "Mínino de 3 caracteres para nome do combustível."),
  ),
  unit: z.optional(z.string("Uma unidade de medida é esperada.")),
  currentPriceVersion: z.optional(ObjectIdString),
});

export const FuelPriceVersionValidator = z.object({
  fuel: z.optional(ObjectIdString),
  price: z
    .number("A versão de preço deve ter um preço.")
    .gt(0, "O preço deve ser maior que zero."),
  version: z
    .number("A versão de preço deve ter um número.")
    .min(1, "O número da versão de preço deve ser maior ou igual a 1."),
});

export const FuelPriceVersionValidatorUpdate = z.object({
  fuel: z.optional(ObjectIdString),
  price: z.optional(z.number().gt(0, "O preço deve ser maior que zero.")),
  // don't want to change version
});

export const CombinedFuelValidator = FuelValidator.extend(
  FuelPriceVersionValidator.shape,
);
