import { isValid } from "date-fns";
import type {
  TranslatedWorkerStatus,
  WorkerFormData,
  WorkerStatus,
  WorkerStatusInfo,
} from "./types";
import type { Vacation, Worker } from "@/app/types";
import { WorkerValidator } from "./validator";
import {
  getDaysUntilWorkerLeave,
  getDaysUntilWorkerReturns,
  getWorkerStatus,
} from "@/app/utils";
import {
  CallMade,
  FlightTakeoff,
  FlightLand,
  CallReceived,
  Person,
  PersonOff,
} from "@mui/icons-material";

/** baseline por tipo */
export const workerBaseline: WorkerFormData = {
  name: "",
  matriculation: "",
  registry: "",
  role: "",
  admissionDate: new Date().toISOString(),
  department: "",
  isExternal: false,
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
  else out.department = raw.department._id as string;
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

export const translateWorkerStatus = (
  status: WorkerStatus
): TranslatedWorkerStatus => {
  switch (status) {
    case "active":
      return "ativo";
    case "onDayOff":
      return "abonando";
    case "onLicense":
      return "licença";
    case "onVacation":
      return "férias";
    case "retired":
      return "desligado";
  }
};

export const getWorkerStatusIcons = ({
  worker,
  vacations,
}: {
  worker: Worker;
  vacations: Vacation[];
}): WorkerStatusInfo[] => {
  const DAY_LIMIT = 10;
  const workerStatus = translateWorkerStatus(
    getWorkerStatus(worker, vacations)
  );
  const workerExternality = worker.isExternal ? "externo" : "interno";
  const info: WorkerStatusInfo[] = [
    {
      name: workerStatus,
      icon:
        workerStatus === "ativo" ? (
          <Person color="success" fontSize="small" />
        ) : workerStatus === "desligado" ? (
          <PersonOff color="secondary" fontSize="small" />
        ) : (
          <Person color="warning" fontSize="small" />
        ),
      tooltipContent: `Trabalhador está ${workerStatus}`,
    },
    {
      name: workerExternality,
      icon: worker.isExternal ? (
        <CallMade color="secondary" fontSize="small" />
      ) : (
        <CallReceived color="primary" fontSize="small" />
      ),
      tooltipContent: `Trabalhador é ${workerExternality}`,
    },
  ];
  const daysUntilLeave: number = getDaysUntilWorkerLeave(worker, vacations);
  const daysUntilReturn = getDaysUntilWorkerReturns(worker, vacations);
  const untilLeaveBadgeContent =
    daysUntilLeave === -1
      ? undefined
      : daysUntilLeave === 0
      ? "hoje"
      : daysUntilLeave;
  const untilReturnBadgeContent =
    daysUntilReturn === -1
      ? undefined
      : daysUntilReturn === 0
      ? "hoje"
      : daysUntilReturn;

  if (daysUntilLeave <= DAY_LIMIT && daysUntilLeave !== -1)
    info.push({
      name: "saindo",
      icon: <FlightTakeoff fontSize="small" color="warning" />,
      badgeContent: untilLeaveBadgeContent?.toString(),
      tooltipContent: `Trabalhador folgará em ${daysUntilLeave} dia(s)`,
    });

  if (daysUntilReturn <= DAY_LIMIT && daysUntilReturn !== -1)
    info.push({
      name: "retornando",
      icon: <FlightLand fontSize="small" color="success" />,
      badgeContent: untilReturnBadgeContent?.toString(),
      tooltipContent: `Trabalhador retornará em ${daysUntilLeave} dia(s)`,
    });

  return info;
};
