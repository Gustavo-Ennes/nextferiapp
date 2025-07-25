import { endOfToday, startOfToday } from "date-fns";
import { mergeAll } from "ramda";

import {
  VacationsQueryOptionsInterface,
  VacationsResolverArgsInterface,
} from "./types";

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

export { buildOptions };
