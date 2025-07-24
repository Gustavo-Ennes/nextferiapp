import { ReactNode } from "react";
import { Entity, EntityType } from "../../types";
export interface ItemListProps<T extends { _id: string }> {
  items: T[];
  routePrefix: EntityType;
  onDelete: (entity: Entity) => void;
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
