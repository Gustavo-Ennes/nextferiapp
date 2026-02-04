import type { BossDTO } from "@/dto";
import type { Boss } from "@/models/Boss";
import { toWorkerDTO } from "../worker/parse";
import { isObjectIdOrHexString, type Types } from "mongoose";

export const toBossDTO = (boss: Boss | Types.ObjectId): BossDTO | string => {
  if (!boss) throw new Error(`Cannot parse boss: boss is ${boss}`);

  if (isObjectIdOrHexString(boss)) return (boss as Types.ObjectId).toString();

  const bossEntity = boss as Boss;

  return {
    ...bossEntity,
    _id: bossEntity._id.toString(),
    createdAt: bossEntity.createdAt.toISOString(),
    updatedAt: bossEntity.updatedAt.toISOString(),
    worker: toWorkerDTO(bossEntity.worker),
  };
};

export const parseBosses = (
  bosses: (Boss | Types.ObjectId)[],
): (BossDTO | string)[] => bosses.map(toBossDTO);
