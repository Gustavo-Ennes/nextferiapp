import { Vacation } from "@/app/types";
import { addMilliseconds } from "date-fns";

export const parseVacations = (vacations: Vacation[] = []): Vacation[] =>
  vacations.map((vacation) => parseVacation(vacation));

export const parseVacation = (vacation: Vacation): Vacation => ({
  ...vacation,
  duration: vacation?.duration ?? vacation?.daysQtd,
  period:
    vacation?.duration === 0.5 || vacation?.daysQtd === 0.5 ? "half" : "full",
  returnDate: addMilliseconds(vacation.endDate, 1),
});
