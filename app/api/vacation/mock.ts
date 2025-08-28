import {
  addDays,
  endOfDay,
  endOfYesterday,
  startOfDay,
  subDays,
  toDate,
} from "date-fns";
import { workers } from "../worker/mock";
import { bosses } from "../boss/mock";
import { endOfMorning } from "@/app/utils";
import type { Vacation } from "@/app/types";

const now = new Date().toISOString();
const today = startOfDay(new Date()).toISOString();
const eightDaysAhead = addDays(today, 8).toISOString();
const eightDaysAgo = subDays(today, 8).toISOString();
const twentyDaysAhead = addDays(today, 20).toISOString();

export const vacations: Vacation[] = [
  // começa em oito dias
  {
    _id: "1",
    duration: 30,
    period: "full",
    type: "normal",
    startDate: eightDaysAhead,
    endDate: addDays(eightDaysAhead, 30).toISOString(),
    deferred: false,
    worker: workers[0],
    createdAt: now,
    updatedAt: now,
    boss: bosses[0],
    observation: "Férias de verão",
  },
  // termina em oito dias
  {
    _id: "2",
    type: "license",
    duration: 15,
    period: "full",
    startDate: subDays(eightDaysAgo, 15).toISOString(),
    endDate: eightDaysAhead,
    deferred: true,
    worker: workers[1],
    createdAt: now,
    updatedAt: now,
    boss: bosses[0],
  },
  // acontencendo
  {
    _id: "3",
    type: "license",
    duration: 30,
    period: "full",
    startDate: subDays(twentyDaysAhead, 30).toISOString(),
    endDate: twentyDaysAhead,
    deferred: false,
    worker: workers[2],
    createdAt: now,
    updatedAt: now,
    boss: bosses[0],
  },
  // retornando hoje
  {
    _id: "4",
    type: "normal",
    duration: 30,
    period: "full",
    startDate: subDays(endOfYesterday(), 30).toISOString(),
    endDate: endOfYesterday().toISOString(),
    deferred: true,
    worker: workers[3],
    createdAt: now,
    updatedAt: now,
    boss: bosses[0],
  },
  {
    _id: "5",
    type: "dayOff",
    duration: 1,
    period: "full",
    startDate: eightDaysAhead,
    endDate: endOfDay(toDate(eightDaysAhead)).toISOString(),
    deferred: false,
    worker: workers[2],
    createdAt: now,
    updatedAt: now,
    boss: bosses[0],
  },
  {
    _id: "6",
    type: "dayOff",
    duration: 0.5,
    period: "half",
    startDate: eightDaysAhead,
    endDate: endOfMorning(toDate(eightDaysAhead)).toISOString(),
    deferred: false,
    worker: workers[1],
    createdAt: now,
    updatedAt: now,
    boss: bosses[0],
  },
];
