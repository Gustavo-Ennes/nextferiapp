import { isValid } from "date-fns";
import z from "zod";

const IsoDateString = z.preprocess((val: string, ctx) => {
  if (typeof val !== "string" || !isValid(new Date(val)))
    ctx.addIssue({ message: "StartDate is invalid.", code: "custom" });
  return val;
}, z.string());

const getObjectIdString = (prop: string) =>
  z
    .string()
    .min(1, "Campo obrigatório")
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid id for ${prop}`);

export const VacationCreateSchema = z.object({
  type: z.enum(["dayOff", "normal", "license"], "Invalid type"),
  period: z.enum(["half", "full"], "Invalid period"),
  duration: z.number().positive("Duration should be a positive number"),
  startDate: IsoDateString,
  worker: getObjectIdString("worker"),
  boss: getObjectIdString("boss"),
  observation: z.string().optional(),
  cancelled: z.boolean().optional()
});

export const VacationUpdateSchema = z.object({
  type: z.enum(["dayOff", "normal", "license"]).optional(),
  period: z.enum(["half", "full"]).optional(),
  duration: z
    .number()
    .positive("Duration should be a positive number")
    .optional(),
  startDate: IsoDateString.optional(),
  worker: getObjectIdString("worker").optional(),
  boss: getObjectIdString("boss").optional(),
  observation: z.string().optional(),
  cancelled: z.boolean().optional()
});
