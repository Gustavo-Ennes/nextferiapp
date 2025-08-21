import { isValid } from "date-fns";
import { MinMaxStringMessageParam, WorkerFormData } from "./types";
import { Worker } from "@/app/types";
import { WorkerValidator } from "./validator";

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

/** baseline por tipo */
export const workerBaseline: WorkerFormData = {
  name: "",
  matriculation: "",
  registry: "",
  role: "",
  admissionDate: new Date().toISOString(),
  department: "",
  isDirector: false,
};

export function normalizeRaw(raw: Worker): Partial<WorkerFormData> {
  if (!raw) return {};
  const out: WorkerFormData = { ...raw } as unknown as WorkerFormData;
  if (
    raw.admissionDate &&
    typeof raw.admissionDate === "string" &&
    isValid(raw.admissionDate)
  ) {
    out.admissionDate = raw.admissionDate;
  }

  if (out.department === "-") out.department = "";
  else out.department = raw.department._id;
  return out;
}

export function prepareDefaults(raw?: any): WorkerFormData {
  const normalized = normalizeRaw(raw);
  const candidate = { ...workerBaseline, ...normalized };
  const parsed = WorkerValidator.safeParse(candidate);
  if (parsed.success) return parsed.data;
  console.warn("prepareDefaults: schema failed", parsed.error.issues);
  // fallback coerced (aceite ou lance)
  return candidate as WorkerFormData;
}

export const isMultipleOf = (value: number, step: number) =>
  Math.abs(value / step - Math.round(value / step)) < Number.EPSILON;
