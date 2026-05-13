import type { BossDTO } from "./BossDTO";

export type DepartmentDTO = {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  hasWorkers?: boolean;
  responsible?: BossDTO | string;
};
