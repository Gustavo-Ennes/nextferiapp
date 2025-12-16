import type { TabData } from "../../lib/repository/weeklyFuellingSummary/types";
import type { Boss, Department, Entity, Vacation, Worker } from "../types";

export type ResponseType<T extends Entity> = Response<T> | PaginatedResponse<T>;

export interface Response<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  error?: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type PeriodOptionsType = "past" | "future" | "present";
export type PdfRouteType =
  | "vacation"
  | "relation"
  | "materialRequisition"
  | "vehicleUsage"
  | "cancellation";
export type PdfOptions = {
  type: PdfRouteType;
  relationType?: string;
  id?: string;
  period?: PeriodOptionsType;
  data?: TabData[];
};
export interface PdfRouteBody {
  items: PdfOptions[];
}
export interface VacationsResolverArgsInterface {
  fromWorker?: string;
  period?: PeriodOptionsType;
  type?: string;
  deferred?: boolean;
  page?: number;
}
export interface VacationsQueryOptionsInterface {
  worker?: string;
  startDate?: {
    $lt?: Date;
    $lte?: Date;
    $gt?: Date;
    $gte?: Date;
  };
  type?: string;
  deferred?: boolean;
  enjoyed?: boolean;
}
export interface AggregatedVacation extends Omit<Vacation, "worker" | "boss"> {
  workerData: Worker;
  bossData: Boss;
}

export interface AggregatedDepartment extends Omit<Department, "responsible"> {
  responsibleData: Boss;
  workerData: Worker;
}

export interface AggregatedBoss extends Omit<Boss, "worker"> {
  workerData: Worker;
}

export interface FacetResult<T extends object> {
  totalItems: Array<{ count: number }>;
  data: T[];
}
