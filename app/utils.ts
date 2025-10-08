import {
  toDate,
  format,
  addDays,
  startOfDay,
  endOfYesterday,
  set,
  differenceInDays,
  addMilliseconds,
} from "date-fns";
import type { Boss, Entity, Vacation, Worker } from "./types";
import type { WorkerStatus } from "./(secure)/worker/types";
import { translateEntityKey } from "./translate";
import { limitText } from "./(secure)/utils";
import { prop, uniqBy } from "ramda";

export const formatCellContent = <T extends Entity>({
  value,
  isName,
  isDate,
  capitalize,
}: {
  value: T[keyof T];
  // when value isn't a obj
  isName?: boolean;
  isDate?: boolean;
  capitalize?: boolean;
}) => {
  try {
    if (value === true) return "Sim";
    if (value === false) return "Não";
    // when value is a obj I want to show the entity name(except vacation)
    if ((value as Entity)?._id)
      return limitText(
        capitalizeName((value as Worker).name ?? (value as Boss).worker?.name)
      );
    if (isName && value) return capitalizeName(value as string);
    if (capitalize && value) return capitalizeFirstLetter(value as string);
    if (isDate) return format(toDate(value as string), "dd/MM/yyyy");
    if (value === undefined || value === null) return "Excluído(a)";
    return String(value);
  } catch {
    return capitalizeFirstLetter(String(value));
  }
};

export const getUpcomingReturns = (
  vacations: Vacation[],
  today: Date = new Date()
): Vacation[] =>
  vacations
    ? vacations.filter(
        ({ endDate }) =>
          toDate(endDate) >= today && toDate(endDate) <= addDays(today, 10)
      )
    : [];

export const getUpcomingLeaves = (
  vacations: Vacation[],
  today: Date = new Date()
): Vacation[] =>
  vacations
    ? vacations.filter(
        ({ startDate }) =>
          toDate(startDate) >= today && toDate(startDate) <= addDays(today, 10)
      )
    : [];

export const getTodayReturns = (vacations: Vacation[]): Vacation[] =>
  vacations
    ? vacations.filter(({ endDate }) => toDate(endDate) === endOfYesterday())
    : [];

export const getWorkerStatus = (
  worker: Worker,
  vacations?: Vacation[]
): WorkerStatus => {
  const vacation = vacations
    ? vacations.find(
        ({ startDate, endDate, worker: vacWorker }) =>
          toDate(startDate) <= startOfDay(new Date()) &&
          toDate(endDate) > startOfDay(new Date()) &&
          vacWorker._id.toString() === worker._id.toString()
      )
    : undefined;

  if (!worker.isActive) return "retired";

  switch (vacation?.type) {
    case "normal":
      return "onVacation";
    case "license":
      return "onLicense";
    case "dayOff":
      return "onDayOff";
    default:
      return "active";
  }
};

export const getWorkersOnVacation = (
  vacations?: Vacation[],
  today: Date = new Date()
): Worker[] =>
  vacations
    ? uniqBy(
        prop("_id"),
        vacations
          .filter(
            ({ startDate, endDate }) =>
              toDate(startDate) <= startOfDay(today) &&
              toDate(endDate) > startOfDay(today)
          )
          .map((vacation) => vacation.worker)
      )
    : [];

// returning zero means the worker returns today
// return -1 means the worker is not on vacation
export const getDaysUntilWorkerReturns = (
  worker: Worker,
  vacations?: Vacation[],
  today: Date = new Date()
): number => {
  const getReturningDate = (endDate: Date) =>
    addMilliseconds(toDate(endDate), 1);

  const vacation = vacations
    ?.filter(
      (vac) =>
        vac.worker?._id === worker._id &&
        getReturningDate(vac.endDate) > startOfDay(today)
    )
    .sort(
      (a, b) =>
        getReturningDate(a.endDate).getTime() -
        getReturningDate(b.endDate).getTime()
    )?.[0];
  if (!vacation) return -1;

  const daysUntilReturn =
    differenceInDays(getReturningDate(vacation.endDate), startOfDay(today)) + 1;

  return daysUntilReturn >= 0 ? daysUntilReturn : -1;
};

// returning zero means the worker leaves today
// return -1 means the worker hasn't a future vacation
export const getDaysUntilWorkerLeave = (
  worker: Worker,
  vacations?: Vacation[],
  today: Date = new Date()
): number => {
  const vacation = vacations
    ?.filter(
      (vac) =>
        vac.worker?._id === worker._id &&
        toDate(vac.startDate) > startOfDay(today)
    )
    .sort(
      (a, b) => toDate(a.startDate).getTime() - toDate(b.startDate).getTime()
    )?.[0];

  if (!vacation) return -1;

  const daysUntilLeave =
    differenceInDays(toDate(vacation.startDate), startOfDay(today)) + 1;

  return daysUntilLeave;
};

export const endOfMorning = (date: Date): Date => {
  const newDate = toDate(date);
  set(newDate, { hours: 13, minutes: 29, seconds: 59, milliseconds: 999 });
  return newDate;
};

export const sumarizeVacation = ({
  worker,
  type,
  startDate,
  duration,
  period,
}: Vacation): string => {
  const isDayOff = type === "dayOff";
  const typeString = translateEntityKey({ entity: "vacation", key: type });
  const startString = isDayOff ? "em" : "à partir de";
  const formatedDate = format(startDate, "dd/MM/yyyy");
  const periodString = !isDayOff ? `( ${duration}D )` : "";
  const dayOffPeriod = period === "half" ? "(meio-período)" : "";
  const vacationPeriod = isDayOff ? dayOffPeriod : periodString;
  const workerString = ` do(a) servidor(a) ${worker?.name}(${worker?.matriculation})`;

  return `${typeString} ${startString} ${formatedDate}${vacationPeriod}${
    worker ? workerString : ""
  }`;
};

export const defaultEntityTableFields = {
  boss: ["worker", "role", "isDirector"],
  worker: ["name", "role", "matriculation", "department"],
  department: ["name", "responsible"],
  vacation: ["worker", "duration", "startDate", "returnDate", "type"],
};

export const capitalizeFirstLetter = (str?: string): string =>
  str ? str.charAt(0)?.toUpperCase() + str.slice(1) : "";

export const capitalizeName = (name?: string): string => {
  const names = name?.split(" ") ?? ["excluído"];
  const notCapitalizable = ["da", "das", "de", "di", "do", "dos"];
  return names
    .map((name) =>
      !notCapitalizable.includes(name)
        ? `${name[0]?.toUpperCase()}${name?.substring(1)}`
        : name
    )
    .join(" ");
};
