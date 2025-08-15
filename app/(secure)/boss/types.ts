import { Worker, Boss } from "@/app/types";

export interface BossFormData {
  worker: string;
  role: string;
  isDirector?: boolean;
}

export interface BossProps {
  defaultValues?: Boss;
  workers: Worker[];
}
