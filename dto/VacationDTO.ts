import type { WorkerDTO } from "./WorkerDTO";
import type { BossDTO } from "./BossDTO";
import type {
  VacationDuration,
  VacationPeriod,
  VacationType,
} from "@/lib/repository/vacation/types";

export type VacationDTO = {
  _id: string;
  duration: VacationDuration;
  type: VacationType;
  period: VacationPeriod;
  startDate: string;
  endDate: string;
  returnDate?: string;
  worker: WorkerDTO | string;
  createdAt: string;
  updatedAt: string;
  boss: BossDTO | string;
  observation?: string;
  cancelled?: boolean;
};
