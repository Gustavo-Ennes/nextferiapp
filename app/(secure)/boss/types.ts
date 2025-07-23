import { Worker, Boss } from "@/app/types";

export interface BossFormData {
  worker: string | null;
  role: string;
}

export interface BossProps {
  defaultValues?: Boss;
  workers: Worker[];
}
