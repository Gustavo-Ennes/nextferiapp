import { isValid } from "date-fns";
import z from "zod";

export const IsoDateString = z.preprocess((val: string, ctx) => {
  if (typeof val !== "string" || isValid(val))
    ctx.addIssue({ message: "Data inválida", code: "custom" });
  return val;
}, z.string());

export const ObjectIdString = z
  .string()
  .min(1, "Campo obrigatório")
  .regex(/^[0-9a-fA-F]{24}$/, "ID inválido");
