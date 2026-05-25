import type { JSX, ReactNode } from "react";
import type { Entity, EntityType } from "../../types";
import type { PaginatedResponse } from "@/app/api/types";
import type { PdfPreviewTypeProp } from "@/context/types";
import type { Types } from "mongoose";
import type { VacationType } from "@/lib/repository/vacation/types";

export type RowFlag = {
  message: string;
  icon: JSX.Element;
};

export type ListPageRowFlags = Map<string, RowFlag[]>;

export type MenuParam = {
  items: MenuItem[];
  label: string;
};

export interface ItemListProps<T extends { _id: Types.ObjectId | string }> {
  pagination: PaginatedResponse<T>;
  routePrefix: EntityType;
  onDelete: (entity: Entity) => void;
  vacationType?: VacationType | null;
  contains?: string | null;
  rowFlags?: ListPageRowFlags;
}

export type MenuItem = {
  label: string;
  action: () => void;
  disabled?: boolean;
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
  menuItems?: MenuItem[];
  rowFlags?: ListPageRowFlags;
};

export type DataListItem = {
  primaryText: string;
  secondaryText?: string;
  id: string;
};

export type TimeSearchProps = {
  past?: boolean | null;
  future?: boolean | null;
  now?: boolean | null;
  to?: Date | null;
  from?: Date | null;
};

export type SearchProps = {
  external: boolean;
  internal: boolean;
  active: boolean;
  time?: TimeSearchProps;
};

export type SearchParams = {
  handleSearchAction: (p: HandleSearchParam) => void;
  routePrefix: EntityType;
  enabledProps: SearchProps;
  isExternal?: boolean | null;
};

export type HandleSearchParam = {
  term: string;
  isExternal?: boolean;
} & TimeSearchProps;
