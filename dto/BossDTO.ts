import type { WorkerDTO } from "./WorkerDTO";

export type BossDTO = {
  _id: string;
  role: string;
  isDirector: boolean;
  worker: WorkerDTO | string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isExternal?: boolean;
};
