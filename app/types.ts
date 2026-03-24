import type { WeeklyFuellingSummary } from "@/models/WeeklyFuellingSummary";
import type { BossDTO, DepartmentDTO, VacationDTO, WorkerDTO } from "@/dto";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import type { FuelDTO } from "@/dto/FuelDTO";

export type Entity =
  | WorkerDTO
  | VacationDTO
  | DepartmentDTO
  | BossDTO
  | WeeklyFuellingSummary
  | PurchaseOrderDTO
  | FuelDTO;
export type EntityType =
  | "department"
  | "worker"
  | "vacation"
  | "boss"
  | "weeklyFuellingSummary"
  | "purchaseOrder"
  | "fuel";
