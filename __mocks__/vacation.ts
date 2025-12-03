import { addDays, startOfDay } from "date-fns";
import type { RawVacation } from "./types";
import { Types } from "mongoose";

const today = startOfDay(new Date()).toISOString();
const startDate = addDays(today, 8).toISOString();
const endDate = addDays(startDate, 30).toISOString();

export const getVacationMock = (): RawVacation => ({
  _id: new Types.ObjectId(),
  duration: 30,
  period: "full",
  type: "normal",
  startDate,
  endDate,
  observation: "Férias de verão",
  worker: new Types.ObjectId(),
  boss: new Types.ObjectId(),
});
