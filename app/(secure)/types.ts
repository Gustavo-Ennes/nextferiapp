import type { EntityType } from "../types";
import type { VacationTypeParam } from "./vacation/types";

export type SearchParam = "type" | "page" | "cancelled" | "isActive";

export type SearchParams = {
  type?: VacationTypeParam | null;
  page?: number | null;
  cancelled?: boolean | null;
  isActive?: boolean | null;
  isDirector?: boolean | null;
  worker?: string | null;
  contains?: string | null;
  isExternal?: boolean | null;
  year?: number | null;
};

export type RawSearchParams = {
  type?: VacationTypeParam | null;
  page?: string | null;
  cancelled?: string | null;
  isActive?: string | null;
  isDirector?: boolean | null;
  worker?: string | null;
  contains?: string | null;
  isExternal?: string | null;
  year?: string | null;
};

export type FetchManyParam = { type?: EntityType; params?: SearchParams };

export type FetchOneParam = {
  id: string;
  type: EntityType;
  params?: SearchParams;
};
