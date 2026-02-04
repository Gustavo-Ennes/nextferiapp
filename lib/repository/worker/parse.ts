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

  return {
    ...workerEntity,
    _id: workerEntity._id.toString(),
    admissionDate: workerEntity.admissionDate.toISOString(),
    createdAt: workerEntity.createdAt.toISOString(),
    updatedAt: workerEntity.updatedAt.toISOString(),
    department: workerEntity.department
      ? toDepartmentDTO(workerEntity.department)
      : undefined,
  };
};

export const parseWorkers = (
  workers: (Worker | Types.ObjectId)[],
): (WorkerDTO | string)[] => workers.map(toWorkerDTO);
