import { Entity } from "@/app/utils";

export interface ItemListProps<T extends { _id: string }> {
  items: T[];
  routePrefix: Entity;
  onDelete: (_id: string | number) => void;
}
