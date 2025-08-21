import { format, addDays, startOfDay, endOfYesterday, set } from "date-fns";
import { Boss, Entity, Vacation, Worker } from "./types";
import { translateEntityKey } from "./translate";

export const formatCellContent = <T extends Entity>({
  value,
  isName,
  isDate,
}: {
  value: T[keyof T];
  // when value isn't a obj
  isName?: boolean;
  isDate?: boolean;
}) => {
  try {
    if (value === true) return "Sim";
    if (value === false) return "Não";
    // when value is a obj I want to show the entity name(except vacation)
    if ((value as Entity)?._id)
      return capitalizeName(
        (value as Worker).name ?? (value as Boss).worker?.name
      );
    if (isName && value) return capitalizeName(value as string);
    if (isDate) return format(new Date(value as string), "dd/MM/yyyy");
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
          new Date(endDate) >= today && new Date(endDate) <= addDays(today, 10)
      )
    : [];

export const getUpcomingLeaves = (
  vacations: Vacation[],
  today: Date = new Date()
): Vacation[] =>
  vacations
    ? vacations.filter(
        ({ startDate }) =>
          new Date(startDate) >= today &&
          new Date(startDate) <= addDays(today, 10)
      )
    : [];

export const getTodayReturns = (vacations: Vacation[]): Vacation[] =>
  vacations
    ? vacations.filter(
        ({ endDate }) =>
          new Date(endDate).getTime() === endOfYesterday().getTime()
      )
    : [];

export const getWorkersOnVacation = (
  vacations?: Vacation[],
  today: Date = new Date()
): Worker[] =>
  vacations
    ? vacations
        .filter(({ startDate, endDate }) => {
          return (
            new Date(startDate) < startOfDay(today) &&
            new Date(endDate) >= startOfDay(today)
          );
        })
        .map((vacation) => vacation.worker)
    : [];

// returning zero means the worker returns today
// return -1 means the worker is not on vacation
export const getDaysUntilWorkerReturns = (
  worker: Worker,
  vacations?: Vacation[],
  today: Date = new Date()
): number => {
  const vacation = vacations?.find(
    (vac) =>
      vac.worker?._id === worker._id &&
      new Date(vac.startDate) <= today &&
      new Date(vac.endDate) >= today
  );
  if (!vacation) return -1;

  const daysUntilReturn = Math.ceil(
    (new Date(vacation.endDate).getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return daysUntilReturn >= 0 ? daysUntilReturn : -1;
};

export const endOfMorning = (date: Date): Date => {
  const newDate = new Date(date);
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

  return `${typeString} ${startString} ${formatedDate}${vacationPeriod}${worker ? workerString : ''}`;
};

export const defaultEntityTableFields = {
  boss: ["worker", "role", "isDirector"],
  worker: ["name", "role", "matriculation", "department"],
  department: ["name", "responsible"],
  vacation: ["worker", "duration", "startDate", "returnDate", "type"],
};

export const capitalizeFirstLetter = (str?: string): string =>
  str ? str.charAt(0)?.toUpperCase() + str.slice(1) : "";

export const capitalizeName = (name: string): string => {
  const names = name.split(" ");
  const notCapitalizable = ["da", "das", "de", "di", "do", "dos"];
  return names
    .map((name) =>
      !notCapitalizable.includes(name)
        ? `${name[0].toUpperCase()}${name.substring(1)}`
        : name
    )
    .join(" ");
};
