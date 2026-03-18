import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import type { IFuelPriceVersion } from "@/models/FuelPriceVersion";
import { isObjectIdOrHexString, type Types } from "mongoose";
import { toFuelDTO } from "../fuel/parse";

export const toFuelPriceVersionDTO = (
  version: IFuelPriceVersion | Types.ObjectId,
): FuelPriceVersionDTO | string => {
  if (isObjectIdOrHexString(version))
    return (version as Types.ObjectId).toString();

  const versionEntity = version as IFuelPriceVersion;

  return {
    _id: versionEntity._id.toString(),
    fuel: toFuelDTO(versionEntity.fuel),
    version: versionEntity.version,
    price: versionEntity.price,
    createdAt: versionEntity.createdAt.toISOString(),
    updatedAt: versionEntity.updatedAt.toISOString(),
  };
};

export const parseFuelPriceVersions = (
  versions: (IFuelPriceVersion | Types.ObjectId)[],
): (FuelPriceVersionDTO | string)[] => versions.map(toFuelPriceVersionDTO);
