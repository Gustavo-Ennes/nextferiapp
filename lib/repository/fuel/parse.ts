import type { FuelDTO } from "@/dto/FuelDTO";
import type { IFuel } from "@/models/Fuel";
import { isObjectIdOrHexString, type Types } from "mongoose";

export const toFuelDTO = (fuel: IFuel | Types.ObjectId): FuelDTO | string => {
  if (!fuel) throw new Error(`Cannot parse fuel: fuel is ${fuel}`);

  if (isObjectIdOrHexString(fuel)) return (fuel as Types.ObjectId).toString();

  const fuelEntity = fuel as IFuel;

  return {
    _id: fuelEntity._id.toString(),
    name: fuelEntity.name,
    unit: fuelEntity.unit,
    pricePerUnit: fuelEntity.pricePerUnit,
    createdAt: fuelEntity.createdAt.toISOString(),
    updatedAt: fuelEntity.updatedAt.toISOString(),
  };
};

export const parseFuels = (
  fuelPrices: (IFuel | Types.ObjectId)[],
): (FuelDTO | string)[] => fuelPrices.map(toFuelDTO);
