import { BossValidator } from "./validator";
import * as z from "zod";
import type { BossDTO, WorkerDTO } from "@/dto";

export type BossFormData = z.infer<typeof BossValidator>;

export interface BossProps {
  defaultValues: BossDTO | null;
  workers: WorkerDTO[];
}
