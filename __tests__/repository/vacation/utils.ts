import WorkerModel, { type Worker } from "@/models/Worker";
import BossModel, { type Boss } from "@/models/Boss";
import DepartmentModel, { type Department } from "@/models/Department";
import { getMocked } from "@/__mocks__";
import type { RawDepartment } from "@/__mocks__/types";
import { dissoc } from "ramda";
import type { BossDTO, DepartmentDTO, WorkerDTO } from "@/dto";
import { toBossDTO } from "@/lib/repository/boss/parse";
import { toWorkerDTO } from "@/lib/repository/worker/parse";
import { toDepartmentDTO } from "@/lib/repository/department/parse";

export type BaseEntities = {
  baseDepartment: DepartmentDTO;
  baseBoss: BossDTO;
  baseWorker: WorkerDTO;
};

export const createBaseEntities = async (): Promise<BaseEntities> => {
  const rawDepartment = getMocked("department") as RawDepartment;
  const departmentPayload = dissoc<RawDepartment, keyof RawDepartment>(
    "_id",
    rawDepartment
  );
  const baseDepartment: Department = await DepartmentModel.create(
    departmentPayload
  );

  const workerPayload = {
    ...getMocked("worker"),
    department: baseDepartment._id,
    _id: undefined,
  };
  const baseWorker: Worker = await WorkerModel.create(workerPayload);

  const bossPayload = {
    ...getMocked("boss"),
    worker: baseWorker._id,
    _id: undefined,
  };
  const baseBoss: Boss = await BossModel.create(bossPayload);

  return {
    baseDepartment: toDepartmentDTO(baseDepartment) as DepartmentDTO,
    baseWorker: toWorkerDTO(baseWorker) as WorkerDTO,
    baseBoss: toBossDTO(baseBoss) as BossDTO,
  };
};
