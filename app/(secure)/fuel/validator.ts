import z from "zod";

export const FuelValidator = z.object({
  name: z.string().min(4),
  unit: z.string(),
  pricePerUnit: z.number().min(0),
});
