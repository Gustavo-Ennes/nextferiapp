import type { ReactNode } from "react";
import type { Entity, EntityType } from "../../types";
import type { PaginatedResponse } from "@/app/api/types";
import type { VacationType } from "../vacation/types";
import type { PdfPreviewTypeProp } from "@/context/types";
import type { Types } from "mongoose";

export interface ItemListProps<T extends { _id: Types.ObjectId | string }> {
  pagination: PaginatedResponse<T>;
  routePrefix: EntityType;
  onDelete: (entity: Entity) => void;
  vacationType?: VacationType | null;
  contains?: string | null;
}

export type MenuItem = {
  label: string;
  action: () => void;
  disabled: boolean;
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
  vacationType?: VacationType | null;
  contains?: string | null;
  isExternal?: boolean | null;
};

export type DataListItem = {
  primaryText: string;
  secondaryText?: string;
  id: string;
};

export type SearchProps = {
  external: boolean;
  internal: boolean;
  active: boolean;
};
