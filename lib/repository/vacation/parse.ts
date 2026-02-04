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

  return {
    ...vacationEntity,
    _id: vacationEntity._id.toString(),
    startDate: vacationEntity.startDate.toISOString(),
    endDate: vacationEntity.endDate.toISOString(),
    createdAt: vacationEntity.createdAt.toISOString(),
    updatedAt: vacationEntity.updatedAt.toISOString(),
    returnDate: vacationEntity.returnDate?.toISOString(),
    boss: toBossDTO(vacationEntity.boss),
    worker: toWorkerDTO(vacationEntity.worker),
  };
};

export const parseVacations = (
  vacations: (Vacation | Types.ObjectId)[],
): (VacationDTO | string)[] => vacations.map(toVacationDTO);
