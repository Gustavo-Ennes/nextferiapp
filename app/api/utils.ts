import { endOfToday, startOfToday } from "date-fns";
import { mergeAll } from "ramda";

import type {
  Response,
  ResponseType,
  VacationsQueryOptionsInterface,
  VacationsResolverArgsInterface,
} from "./types";
import type { Entity } from "../types";
import { NextResponse } from "next/server";
import type { Model } from "mongoose";
import type { BossDTO } from "@/dto";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";

export const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export const genericResponseWithHeaders = (data: any) =>
  NextResponse.json(data, {
    headers,
    status: (data as Response<BossDTO>).error ? 400 : 200,
  });

export const responseWithHeaders = <T extends Entity>(data: ResponseType<T>) =>
  NextResponse.json(data, {
    headers,
    status: (data as Response<BossDTO>).error ? 400 : 200,
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

// function to populate new default props to past documents without the prop
async function applyDefaultField<T>(model: Model<T>) {
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
      `Documentos encontrados para atualização: ${result.matchedCount}`,
    );
    console.log(`Documentos modificados: ${result.modifiedCount}`);
  } catch (error) {
    console.error("Erro durante a migração:", error);
  }
}

const filterPurchaseOrderItems = ({
  orders,
  fuels,
}: {
  orders: PurchaseOrderDTO[];
  fuels: FuelDTO[];
}): PurchaseOrderDTO[] =>
  orders.reduce<PurchaseOrderDTO[]>((acc, order) => {
    const filteredOrder = { ...order };

    try {
      filteredOrder.items = order.items.filter((i) => {
        const itemFuel = fuels.find((f) => f._id === (i.fuel as FuelDTO)._id);
        const itemFuelPriceVersion = i.fuelPriceVersion as FuelPriceVersionDTO;

        if (!itemFuel)
          throw new Error(`Fuel not found(_id: ${(i.fuel as FuelDTO)._id})`);

        const areVersionsEqual =
          (itemFuel.currentPriceVersion as FuelPriceVersionDTO).version ===
          itemFuelPriceVersion.version;
        const isQuantityLow = i.quantity < 10;
        const shouldRemoveItem = !areVersionsEqual || isQuantityLow;
        const message = shouldRemoveItem
          ? `Order ref.: ${order.reference} ~ item: ${itemFuel.name}: ${isQuantityLow ? `low quantity: ${i.quantity}.` : `item is in v${itemFuelPriceVersion.version} and ${itemFuel.name} is in v${(itemFuel.currentPriceVersion as FuelPriceVersionDTO).version}.`}`
          : "";

        if (shouldRemoveItem) {
          console.error(message);
        }

        return !shouldRemoveItem;
      });
    } catch (error) {
      console.error(
        `Error filtering order items by it's fuel versions and quantity: ${(error as Error).message}`,
      );
    } finally {
      return filteredOrder.items.length > 0 ? [...acc, filteredOrder] : acc;
    }
  }, []);

const PAGINATION_LIMIT = 20 as const;

export {
  buildOptions,
  applyDefaultField,
  PAGINATION_LIMIT,
  filterPurchaseOrderItems,
};
