import {
  addDays,
  endOfDay,
  endOfToday,
  startOfDay,
  startOfToday,
} from "date-fns";
import { mergeAll } from "ramda";

import type {
  Response,
  ResponseType,
  VacationsQueryOptionsInterface,
  VacationsResolverArgsInterface,
} from "./types";
import type { Boss, Entity, Vacation } from "../types";
import { NextResponse } from "next/server";

export const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export const responseWithHeaders = <T extends Entity>(data: ResponseType<T>) =>
  NextResponse.json(data, {
    headers,
    status: (data as Response<Boss>).error ? 400 : 200,
  });

export const optionsResponse = () =>
  new NextResponse(null, { status: 200, headers });

const buildOptions = ({
  deferred,
  fromWorker,
  period,
  type,
}: VacationsResolverArgsInterface) => {
  const worker = fromWorker || undefined;
  const options: VacationsQueryOptionsInterface = {};
  const periods = {
    future: { startDate: { $gt: endOfToday().toISOString() } },
    past: { endDate: { $lt: startOfToday().toISOString() } },
    present: {
      $and: [
        { startDate: { $lte: endOfToday().toISOString() } },
        { endDate: { $gte: startOfToday().toISOString() } },
      ],
    },
  };

  // because it don't work if a prop is declared but undefined
  if (deferred !== undefined) options.deferred = deferred;
  if (worker) options.worker = worker;
  if (type) options.type = type;
  if (period) return mergeAll([options, periods[period]]);

  return options;
};

const updateVacationDates = (vacation: Vacation): Vacation => ({
  ...vacation,
  ...(vacation.startDate && {
    startDate: startOfDay(new Date(vacation.startDate)).toISOString(),
    endDate: endOfDay(
      addDays(
        new Date(vacation.startDate),
        ((vacation.duration ?? vacation.daysQtd) as number) - 1
      )
    ).toISOString(),
    returnDate: startOfDay(
      addDays(
        new Date(vacation.startDate),
        (vacation.duration ?? vacation.daysQtd) as number
      )
    ).toISOString(),
  }),
});

export { buildOptions, updateVacationDates };
