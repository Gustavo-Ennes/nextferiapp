import type { BossDTO } from "@/dto";
import type { Boss } from "@/models/Boss";
import { toWorkerDTO } from "../worker/parse";
import { isObjectIdOrHexString, type Types } from "mongoose";

export const toBossDTO = (boss: Boss | Types.ObjectId): BossDTO | string => {
  if (!boss) throw new Error(`Cannot parse boss: boss is ${boss}`);

  if (isObjectIdOrHexString(boss)) return (boss as Types.ObjectId).toString();

  const bossEntity = boss as Boss;
  const {
    _id,
    role,
    isDirector,
    worker,
    createdAt,
    updatedAt,
    isActive,
    isExternal,
  } = bossEntity;

  return {
    _id: _id.toString(),
    role,
    isDirector,
    worker: toWorkerDTO(worker),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    isActive,
    isExternal,
  };
};

export const parseBosses = (
  bosses: (Boss | Types.ObjectId)[],
): (BossDTO | string)[] => bosses.map(toBossDTO);
