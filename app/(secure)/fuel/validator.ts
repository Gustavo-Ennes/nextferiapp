import z from "zod";
import { ObjectIdString } from "../vacation/validatorUtils";

export const FuelValidator = z.object({
  name: z.string().min(3, "Mínino de 3 caracteres para nome do combustível."),
  unit: z.string("Uma unidade de medida é esperada"),
});

export const FuelPriceVersionValidator = z.object({
  fuel: z.optional(ObjectIdString),
  price: z.number().gt(0, "O preço deve ser maior que zero."),
  version: z.number().min(1),
});

export const CombinedFuelValidator = FuelValidator.extend(
  FuelPriceVersionValidator.shape,
);
