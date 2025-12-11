import type { Vacation } from "@/app/types";
import type { VacationFormData } from "./types";
import { VacationValidator } from "./validator";
import { addDays, format, isThisYear, isValid, toDate } from "date-fns";
import type { DataListItem } from "../components/types";
import { prop, sum, uniqBy } from "ramda";
import { endOfDaySP, endOfHalfDay, startOfDaySP } from "@/app/utils";
import { fetchAllPaginated } from "../utils";

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
  const now = startOfDaySP(new Date()).toISOString();
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
  else if (raw.worker) out.worker = raw.worker._id as string;
  if (out.boss === "-") out.boss = "";
  else if (raw.boss) out.boss = raw.boss._id as string;
  return out;
}

export function prepareDefaults(raw: Vacation): VacationFormData {
  const type = raw.type ?? "normal";
  const baseline = baselineForType(type);
  const normalized = normalizeRaw(raw);
  const candidate = {
    ...baseline,
    ...normalized,
    ...(raw.cancelled && {
      observation: `${raw.observation}\nReagendada: data anterior(${format(
        toDate(raw.startDate),
        "dd/MM/yy"
      )})[${raw._id as string}]`,
    }),
  };
  const parsed = VacationValidator.safeParse(candidate);
  if (parsed.success) return parsed.data;
  console.warn("prepareDefaults: schema failed", parsed.error.issues);
  // fallback coerced (aceite ou lance)
  return candidate as VacationFormData;
}

export const isMultipleOf = (value: number, step: number) =>
  Math.abs(value / step - Math.round(value / step)) < Number.EPSILON;

export const parseToDataList = (vacations: Vacation[]): DataListItem[] =>
  uniqBy(
    prop("id"),
    vacations.map(({ type, startDate, period, duration, _id }) => ({
      primaryText: format(toDate(startDate), "dd/MM/yyyy"),
      secondaryText:
        type === "dayOff"
          ? period === "full"
            ? "Integral"
            : "Meio-expediente"
          : `${duration} dias.`,
      id: _id as string,
    }))
  );

export const getWorkerDayOffsLeft = (vacations: Vacation[]): number => {
  const DAYOFFS_A_YEAR = 6;
  const dayOffsTakenThisYear = sum(
    vacations
      .filter(
        ({ type, startDate }) => type === "dayOff" && isThisYear(startDate)
      )
      .map((vacation) => vacation.duration)
  );

  return DAYOFFS_A_YEAR - dayOffsTakenThisYear;
};

export const checkDayOffsCount = () => {};

export const checkOverlappingVacations = async (
  watchForm: VacationFormData,
  id?: string | null
) => {
  const from = startOfDaySP(toDate(watchForm.startDate));
  const to =
    watchForm.duration < 1
      ? endOfHalfDay(from)
      : watchForm.duration === 1
      ? endOfDaySP(from)
      : endOfDaySP(addDays(from, watchForm.duration - 1));

  const conflicting = await fetchAllPaginated<Vacation>({
    type: "vacation",
    params: {
      worker: watchForm.worker,
      type: "all",
      from,
      to,
      cancelled: false,
      ...(id && { exclude: id }),
    },
  });

  if (conflicting.length > 0)
    console.warn(
      `Conflicting vacations: ${JSON.stringify(
        conflicting
          .sort(
            (a, b) =>
              toDate(a.startDate).getTime() - toDate(b.startDate).getTime()
          )
          .map(({ duration, startDate, _id, endDate }) => ({
            _id,
            duration,
            startDate,
            endDate,
          })),
        null,
        2
      )}`
    );

  return conflicting;
};
