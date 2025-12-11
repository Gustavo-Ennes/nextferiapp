import * as z from "zod";
import { isValid } from "date-fns";
import { isMultipleOf } from "./utils";

/* ----- Constantes ----- */
export const DURATION_VALUES = [0.5, 1, 15, 30, 45, 60, 75, 90] as const;
export type DurationValue = (typeof DURATION_VALUES)[number];

export const LICENSE_MIN = 15;
export const LICENSE_MAX = 90;
export const LICENSE_STEP = 15;

const IsoDateString = z.preprocess((val: string, ctx) => {
  if (typeof val !== "string" || isValid(val))
    ctx.addIssue({ message: "Data inválida", code: "custom" });
  return val;
}, z.string());

const ObjectIdString = z
  .string()
  .min(1, "Campo obrigatório")
  .regex(/^[0-9a-fA-F]{24}$/, "ID inválido");

export const VacationValidator = z
  .object({
    type: z.enum(["dayOff", "normal", "license"]),
    period: z.enum(["half", "full"]),
    duration: z.number(),
    startDate: IsoDateString,
    worker: ObjectIdString,
    boss: ObjectIdString,
    observation: z.string().optional(),
    cancelled: z.optional(z.boolean()),
    endDate: z.optional(IsoDateString),
    returnDate: z.optional(IsoDateString),
  })
  .superRefine((data, ctx) => {
    /* Validações condicionais por tipo */

    if (data.type === "dayOff") {
      if (![0.5, 1].includes(data.duration)) {
        ctx.addIssue({
          code: "custom",
          path: ["duration"],
          message: "Duração inválida para Abonada (use 0.5 ou 1)",
        });
      }
      if (data.period === "half" && data.duration !== 0.5) {
        ctx.addIssue({
          code: "custom",
          path: ["period"],
          message: "Meio período só pode ter duração 0.5",
        });
      }
      if (data.period === "full" && data.duration === 0.5) {
        ctx.addIssue({
          code: "custom",
          path: ["period"],
          message: "Integral deve ter duração >= 1",
        });
      }
    }

    if (data.type === "normal") {
      if (![15, 30].includes(data.duration)) {
        ctx.addIssue({
          code: "custom",
          path: ["duration"],
          message: "Férias devem ter 15 ou 30 dias",
        });
      }
      if (data.period !== "full") {
        ctx.addIssue({
          code: "custom",
          path: ["period"],
          message: "Férias só podem ser período integral",
        });
      }
    }

    if (data.type === "license") {
      if (
        data.duration < LICENSE_MIN ||
        data.duration > LICENSE_MAX ||
        !isMultipleOf(data.duration, LICENSE_STEP)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["duration"],
          message: `Licença deve ter múltiplos de ${LICENSE_STEP} entre ${LICENSE_MIN} e ${LICENSE_MAX}`,
        });
      }
      if (data.period !== "full") {
        ctx.addIssue({
          code: "custom",
          path: ["period"],
          message: "Licença só pode ser integral",
        });
      }
    }
  });
