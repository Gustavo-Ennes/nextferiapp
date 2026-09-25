import type { EntityType } from "../types";
import type { VacationTypeParam } from "@/lib/repository/vacation/types";
import type { Repository } from "@/lib/repository/types";
import type { PeriodOptionsType } from "../api/types";
import type { TimeSearchProps } from "./components/types";
import type { PdfPreviewItem } from "@/context/types";

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
  hasWorkers?: boolean | null;
  time?: TimeSearchProps;
  exclude?: string | null;
  timePeriod?: PeriodOptionsType | null;
  hideLowBalance?: boolean | null;
  hideOutdated?: boolean | null;
  supplier?: string | null;
};

// E: entity
// FD: entity Form Data
export type FetchAllParam<E, FD> = SearchParams & {
  repository: Repository<E, FD>;
  entityType: EntityType;
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
  from?: string | null;
  to?: string | null;
  past?: string | null;
  future?: string | null;
  now?: string | null;
  snackbarMessage?: string | null;
  hideLowBalance?: boolean | null;
  hideOutdated?: boolean | null;
  supplier?: string | null;
};

export type FetchOneParam = {
  id: string;
  type: EntityType;
  params?: SearchParams;
};
export interface PdfData {
  items: PdfPreviewItem[];
  opened: boolean;
}

export interface LocalStorageData {
  pdfData: PdfData;
  lastPage?: string;
}
