import type { WeeklyFuellingSummary } from "@/models/WeeklyFuellingSummary";
import type { BossDTO, DepartmentDTO, VacationDTO, WorkerDTO } from "@/dto";

export type Entity =
  | WorkerDTO
  | VacationDTO
  | DepartmentDTO
  | BossDTO
  | WeeklyFuellingSummary;
export type EntityType =
  | "department"
  | "worker"
  | "vacation"
  | "boss"
  | "weeklyFuellingSummary";
