import { addDays, endOfYesterday, startOfDay, subDays } from "date-fns";
import { workers } from "../worker/mock";
import { bosses } from "../boss/mock";


const today = startOfDay(new Date());
const eightDaysAhead = addDays(today, 8);
const eightDaysAgo = subDays(today, 8);
const twentyDaysAhead = addDays(today, 20);

export const vacations = [
  // começa em oito dias
  {
    _id: "1",
    daysQtd: 30,
    startDate: eightDaysAhead,
    endDate: addDays(eightDaysAhead, 30),
    deferred: false,
    worker: workers[0],
    createdAt: new Date(),
    updatedAt: new Date(),
    boss: bosses[0],
    observation: "Férias de verão",
  },
  // termina em oito dias
  {
    _id: "2",
    daysQtd:15,
    startDate: subDays(eightDaysAgo, 15),
    endDate:eightDaysAhead,
    deferred: true,
    worker: workers[1],
    createdAt: new Date(),
    updatedAt: new Date(),
    boss: bosses[0],
  },
  // acontencendo
  {
    _id: "3",
    daysQtd: 30,
    startDate: subDays(twentyDaysAhead, 30),
    endDate: twentyDaysAhead,
    deferred: false,
    worker: workers[2],
    createdAt: new Date(),
    updatedAt: new Date(),
    boss: bosses[0],
  },
  // retornando hoje
  {
    _id: "4",
    daysQtd: 30,
    startDate: subDays(endOfYesterday(), 30),
    endDate: endOfYesterday(),
    deferred: true,
    worker: workers[3],
    createdAt: new Date(),
    updatedAt: new Date(),
    boss: bosses[0],
  },
];
