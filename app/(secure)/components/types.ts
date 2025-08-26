import { ReactNode } from "react";
import { Entity, EntityType, Vacation } from "../../types";
import { PaginatedResponse } from "@/app/api/types";
import { VacationType } from "../vacation/types";
import { PdfPreviewTypeProp } from "@/context/types";

export interface ItemListProps<T extends { _id: string }> {
  pagination: PaginatedResponse<T>;
  routePrefix: EntityType;
  onDelete: (entity: Entity) => void;
  vacationType?: VacationType;
}

export type MenuItem = {
  label: string;
  action: () => void;
};

export type SubMenuItem = {
  href?: string;
  itemIcon: ReactNode;
  itemLabel: string;
  pdfType?: PdfPreviewTypeProp;
};

export type ListItemMenuItem = {
  icon: ReactNode;
  label: string;
  items: SubMenuItem[];
};

export type ResponsiveListPageParam<T> = {
  paginatedResponse: PaginatedResponse<T>;
  routePrefix: EntityType;
  pageTitle?: string;
  vacationType?: VacationType;
};
