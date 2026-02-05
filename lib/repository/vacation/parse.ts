import type { VacationDTO } from "@/dto";
import type { Vacation } from "@/models/Vacation";
import { toBossDTO } from "../boss/parse";
import { toWorkerDTO } from "../worker/parse";
import { Types, isObjectIdOrHexString } from "mongoose";

export const toVacationDTO = (
  vacation: Vacation | Types.ObjectId,
): VacationDTO | string => {
  if (!vacation)
    throw new Error(`Cannot parse vacation: vacation is ${vacation}`);

  if (isObjectIdOrHexString(vacation))
    return (vacation as Types.ObjectId).toString();

  const vacationEntity = vacation as Vacation;
  const {
    _id,
    duration,
    type,
    period,
    startDate,
    endDate,
    returnDate,
    worker,
    createdAt,
    updatedAt,
    boss,
    observation,
    cancelled,
  } = vacationEntity;

  return {
    _id: _id.toString(),
    duration,
    type,
    period,
    observation,
    cancelled,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    returnDate: returnDate?.toISOString(),
    boss: toBossDTO(boss),
    worker: toWorkerDTO(worker),
  };
};

export const parseVacations = (
  vacations: (Vacation | Types.ObjectId)[],
): (VacationDTO | string)[] => vacations.map(toVacationDTO);
