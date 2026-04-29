import { isValid } from "date-fns";
import z from "zod";
import type { MinMaxStringMessageParam } from "./types";

export const IsoDateString = z.preprocess((val: string, ctx) => {
  if (typeof val !== "string" || isValid(val))
    ctx.addIssue({ message: "Data inválida", code: "custom" });
  return val;
}, z.string());

export const ObjectIdString = z
  .string()
  .min(1, "Campo obrigatório")
  .regex(/^[0-9a-fA-F]{24}$/, "ID inválido");


const translatedProps = {
  name: "nome",
  role: "cargo",
  registry: "registro",
  matriculation: "matrícula",
  justification: "justificativa",
};

const nameAndRoleLimits = {
  max: 60,
  min: 5,
};
const registryAndMatriculationLimits = {
  max: 6,
  min: 4,
};

const minMaxByProp = {
  name: nameAndRoleLimits,
  role: nameAndRoleLimits,
  registry: registryAndMatriculationLimits,
  matriculation: registryAndMatriculationLimits,
  justification: { ...nameAndRoleLimits, max: 100 },
};

export const minMaxStringMessage = ({
  prop,
  condition,
}: MinMaxStringMessageParam) => {
  const propString = translatedProps[prop];
  const conditionString = condition === "max" ? "ter menos" : "ter mais";
  const charQtd = minMaxByProp[prop][condition];

  return `O ${propString} precisa ${conditionString} ${charQtd} caracteres.`;
};

