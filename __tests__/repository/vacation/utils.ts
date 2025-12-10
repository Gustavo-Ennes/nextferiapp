import WorkerModel from "@/models/Worker";
import BossModel from "@/models/Boss";
import DepartmentModel from "@/models/Department";
import { getMocked } from "@/__mocks__";
import type { RawDepartment } from "@/__mocks__/types";
import { dissoc } from "ramda";
import type { Boss, Department, Worker } from "@/app/types";

export const createBaseEntities = async () => {
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

  return { baseDepartment, baseWorker, baseBoss };
};
