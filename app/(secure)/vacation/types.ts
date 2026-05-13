import * as z from "zod";
import { VacationCreateSchema } from "@/lib/validators/vacation";
import type { VacationType } from "@/lib/repository/vacation/types";
import type { BossDTO, VacationDTO, WorkerDTO } from "@/dto";

export type VacationFormData = z.infer<typeof VacationCreateSchema>;

export interface VacationProps {
  workers: WorkerDTO[];
  bosses: BossDTO[];
  defaultValues: VacationDTO | null;
  id?: string;
  type: VacationType;
  isReschedule?: boolean | null;
  cancellationPdf?: boolean | null;
}
