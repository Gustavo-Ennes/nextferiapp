import { Vacation } from "@/app/types";
import { VacationFormData } from "./types";
import { VacationValidator } from "./validator";
import { isValid } from "date-fns";

export const getTypeLabel = (type: string) => {
  switch (type) {
    case "normal":
      return "Férias";
    case "license":
      return "Licença-Prêmio";
    case "dayOff":
      return "Abonada";
    default:
      return "Tipo Desconhecido";
  }
};

/** baseline por tipo */
export function baselineForType(type: Vacation["type"]): VacationFormData {
  const now = new Date().toISOString();
  if (type === "dayOff") {
    return {
      type: "dayOff",
      period: "full",
      duration: 1,
      startDate: now,
      worker: "",
      boss: "",
      observation: undefined,
    };
  }
  if (type === "license") {
    return {
      type: "license",
      period: "full",
      duration: 15,
      startDate: now,
      worker: "",
      boss: "",
      observation: undefined,
    };
  }
  return {
    type: "normal",
    period: "full",
    duration: 15,
    startDate: now,
    worker: "",
    boss: "",
    observation: undefined,
  };
}

export function normalizeRaw(raw: Vacation): Partial<VacationFormData> {
  if (!raw) return {};
  const out: VacationFormData = { ...raw } as unknown as VacationFormData;
  if (raw.startDate && typeof raw.startDate === "string" && isValid(raw)) {
    out.startDate = raw.startDate;
  }
  // normaliza duração string -> number
  if (raw.duration !== undefined) {
    const n = Number(raw.duration);
    if (!Number.isNaN(n)) out.duration = n;
  }
  if (out.worker === "-") out.worker = "";
  else out.worker = raw.worker._id
  if (out.boss === "-") out.boss = "";
  else out.boss = raw.boss._id;
  return out;
}

export function prepareDefaults(raw?: any): VacationFormData {
  const type = raw?.type ?? "normal";
  const baseline = baselineForType(type);
  const normalized = normalizeRaw(raw);
  const candidate = { ...baseline, ...normalized };
  const parsed = VacationValidator.safeParse(candidate);
  if (parsed.success) return parsed.data;
  console.warn("prepareDefaults: schema failed", parsed.error.issues);
  // fallback coerced (aceite ou lance)
  return candidate as VacationFormData;
}

export const isMultipleOf = (value: number, step: number) =>
  Math.abs(value / step - Math.round(value / step)) < Number.EPSILON;
