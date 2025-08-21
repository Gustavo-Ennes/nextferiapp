import * as z from "zod";
import { minMaxStringMessage } from "./utils";
import { isValid } from "date-fns";

const departmentMissingStr = "O departamento é obrigatório.";

export const WorkerValidator = z.object({
  name: z
    .string()
    .min(5, minMaxStringMessage({ prop: "name", condition: "min" }))
    .max(60, minMaxStringMessage({ prop: "name", condition: "max" })),
  role: z
    .string()
    .min(5, minMaxStringMessage({ prop: "role", condition: "min" }))
    .max(60, minMaxStringMessage({ prop: "role", condition: "max" })),
  registry: z
    .string()
    .min(4, minMaxStringMessage({ prop: "registry", condition: "min" }))
    .max(6, minMaxStringMessage({ prop: "registry", condition: "max" })),
  matriculation: z
    .string()
    .min(4, minMaxStringMessage({ prop: "matriculation", condition: "min" }))
    .max(6, minMaxStringMessage({ prop: "matriculation", condition: "max" })),
  admissionDate: z.preprocess((val: string, ctx) => {
    if (typeof val !== "string" || isValid(val))
      ctx.addIssue({ message: "Data inválida", code: "custom" });
    return val;
  }, z.string()),
  department: z
    .string()
    .min(1, "Campo obrigatório")
    .regex(/^[0-9a-fA-F]{24}$/, departmentMissingStr),
  justification: z.optional(
    z
      .string()
      .min(4, minMaxStringMessage({ prop: "justification", condition: "min" }))
      .max(6, minMaxStringMessage({ prop: "justification", condition: "max" }))
  ),
  isDirector: z.boolean(),
});
