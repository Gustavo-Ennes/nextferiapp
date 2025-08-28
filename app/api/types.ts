import type { TabData } from "../(secure)/materialRequisition/types";

export interface Response<T> {
  data: T;
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
