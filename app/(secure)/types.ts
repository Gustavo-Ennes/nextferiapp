import type { EntityType } from "../types";
import type { VacationType } from "./vacation/types";

export type SearchParam = "type" | "page" | "cancelled" | "isActive";

export type SearchParams = {
  type?: VacationType;
  page?: number;
  cancelled?: boolean;
  isActive?: boolean;
  isDirector?: boolean;
  worker?: string;
};

export type FetchManyParam = { type?: EntityType; params?: SearchParams };

export type FetchOneParam = {
  id: string;
  type: EntityType;
  params?: SearchParams;
};
