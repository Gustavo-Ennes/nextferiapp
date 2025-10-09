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
import type { Model } from "mongoose";

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
    startDate: startOfDay(new Date(vacation.startDate)),
    endDate: endOfDay(
      addDays(
        new Date(vacation.startDate),
        ((vacation.duration ?? vacation.daysQtd) as number) - 1
      )
    ),
    returnDate: startOfDay(
      addDays(
        new Date(vacation.startDate),
        (vacation.duration ?? vacation.daysQtd) as number
      )
    ),
  }),
});

const getBooleanStringSearchParam = (param: string | null): boolean | null => {
  if (param === "false") return false;
  if (param == "true") return true;
  return null;
};

export { buildOptions, updateVacationDates, getBooleanStringSearchParam };

// function to populate new default props to past documents without the prop
export async function applyDefaultField<T>(model: Model<T>) {
  try {
    console.log("Iniciando migração de campo default...");

    // Define o nome do campo e o valor padrão
    const field = "isExternal";
    const defaultValue = false;

    // O filtro { [campo]: { $exists: false } } garante
    // que apenas documentos que não têm o campo sejam atualizados.
    const filter = { [field]: { $exists: false } };

    // O update {$set: {[campo]: valorPadrao}} adiciona o campo com o valor.
    const update = { $set: { [field]: defaultValue } };

    const result = await model.updateMany(filter, update);

    console.log(`Migração concluída!`);
    console.log(
      `Documentos encontrados para atualização: ${result.matchedCount}`
    );
    console.log(`Documentos modificados: ${result.modifiedCount}`);
  } catch (error) {
    console.error("Erro durante a migração:", error);
  }
}
