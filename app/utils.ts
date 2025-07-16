import {
  isDate,
  format,
  addDays,
  startOfDay,
  endOfYesterday,
  set,
} from "date-fns";
import { Vacation, Worker } from "./types";
import { translateEntityKey } from "./translate";

export const formatCellContent = <T extends { _id: string }>(
  value: T[keyof T]
) => (isDate(value) ? format(value, "dd/MM/yyyy") : String(value));

export const getUpcomingReturns = (
  vacations: Vacation[],
  today: Date = new Date()
): Vacation[] =>
  vacations.filter(
    ({ endDate }) =>
      new Date(endDate) >= today && new Date(endDate) <= addDays(today, 10)
  );

export const getUpcomingLeaves = (
  vacations: Vacation[],
  today: Date = new Date()
): Vacation[] =>
  vacations.filter(
    ({ startDate }) =>
      new Date(startDate) >= today && new Date(startDate) <= addDays(today, 10)
  );

export const getTodayReturns = (vacations: Vacation[]): Vacation[] =>
  vacations.filter(
    ({ endDate }) => new Date(endDate).getTime() === endOfYesterday().getTime()
  );

export const getWorkersOnVacation = (
  vacations: Vacation[],
  today: Date = new Date()
): Worker[] =>
  vacations
    .filter(({ startDate, endDate }) => {
      return (
        new Date(startDate) < startOfDay(today) &&
        new Date(endDate) >= startOfDay(today)
      );
    })
    .map((vacation) => vacation.worker);

// returning zero means the worker returns today
// return -1 means the worker is not on vacation
export const getDaysUntilWorkerReturns = (
  worker: Worker,
  vacations: Vacation[],
  today: Date = new Date()
): number => {
  const vacation = vacations.find(
    (vac) =>
      vac.worker._id === worker._id &&
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

export const sumarizeVacation = (vacation: Vacation): string => {
  const isDayOff = vacation.type === 'dayOff'
  const type = translateEntityKey({ entity: "vacation", key: vacation.type });
  const startString = isDayOff ? "em" : "à partir de";
  const formatedDate = format(vacation.startDate, "dd/MM/yyyy");
  const period = !isDayOff ? `( ${vacation.duration}D )` : ""
  const dayOffPeriod = vacation.period === "half" ? "(meio-período)" : "";
  const vacationPeriod = isDayOff ? dayOffPeriod : period;
  const workerString = `do(a) servidor(a) ${vacation.worker.name}(${vacation.worker.matriculation})`;

  return `${type} ${startString} ${formatedDate}${vacationPeriod} ${workerString}`;
};
