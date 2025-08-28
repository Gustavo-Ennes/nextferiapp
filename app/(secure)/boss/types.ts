import type { Worker, Boss } from "@/app/types";
import { BossValidator } from "./validator";
import * as z from "zod";

export type BossFormData = z.infer<typeof BossValidator>;

export interface BossProps {
  defaultValues?: Boss;
  workers: Worker[];
}
