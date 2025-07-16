import { Entity, EntityType } from "../../types";
export interface ItemListProps<T extends { _id: string }> {
  items: T[];
  routePrefix: EntityType;
  onDelete: (entity: Entity) => void;
}
