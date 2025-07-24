import { ReactNode } from "react";
import { Entity, EntityType, Vacation } from "../../types";
import { PaginatedResponse } from "@/app/api/types";
import { VacationType } from "../vacation/types";
export interface ItemListProps<T extends { _id: string }> {
  pagination: PaginatedResponse<T>;
  routePrefix: EntityType;
  onDelete: (entity: Entity) => void;
  vacationType?: VacationType
}

export type MenuItem = {
  label: string;
  action: () => void;
};

export type ListItemMenuItem = {
  icon: ReactNode;
  label: string;
  items: {
    href: string;
    itemIcon: ReactNode;
    itemLabel: string;
  }[];
};

export type ResponsiveListPageParam<T> = {
  paginatedResponse: PaginatedResponse<T>;
  routePrefix: EntityType;
  pageTitle?: string;
  vacationType?: VacationType;
};
