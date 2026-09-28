import type {
  BossDTO,
  DepartmentDTO,
  VacationDTO,
  WorkerDTO,
  PurchaseOrderDTO,
  FuelDTO,
  FuelingBatchDTO,
  FuelingBatchTableLine,
  SupplierDTO,
} from "@/dto";

export type Entity =
  | WorkerDTO
  | VacationDTO
  | DepartmentDTO
  | BossDTO
  | PurchaseOrderDTO
  | FuelDTO
  | FuelingBatchDTO
  | FuelingBatchTableLine
  | SupplierDTO;
export type EntityType =
  | "department"
  | "worker"
  | "vacation"
  | "boss"
  | "purchaseOrder"
  | "fuel"
  | "fuelingBatch"
  | "supplier";
