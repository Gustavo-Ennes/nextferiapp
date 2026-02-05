import type { WorkerDTO } from "@/dto";
import type { Worker } from "@/models/Worker";
import { toDepartmentDTO } from "../department/parse";
import { isObjectIdOrHexString, Types } from "mongoose";

export const toWorkerDTO = (
  worker: Worker | Types.ObjectId,
): WorkerDTO | string => {
  if (!worker) throw new Error(`Cannot parse worker: worker is ${worker}`);

  if (isObjectIdOrHexString(worker))
    return (worker as Types.ObjectId).toString();

  const workerEntity = worker as Worker;
  const {
    _id,
    name,
    role,
    matriculation,
    registry,
    admissionDate,
    department,
    justification,
    isActive,
    createdAt,
    updatedAt,
    isExternal,
  } = workerEntity;

  return {
    _id: _id.toString(),
    name,
    role,
    registry,
    matriculation,
    admissionDate: admissionDate.toISOString(),
    department: department
      ? toDepartmentDTO(workerEntity.department)
      : undefined,
    justification,
    isActive,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    isExternal,
  };
};

export const parseWorkers = (
  workers: (Worker | Types.ObjectId)[],
): (WorkerDTO | string)[] => workers.map(toWorkerDTO);
