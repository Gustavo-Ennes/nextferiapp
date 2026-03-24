import type z from "zod";
import type { PurchaseOrderValidator } from "./validator";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import type { DepartmentDTO } from "@/dto";
import type { FuelDTO } from "@/dto/FuelDTO";

export type PurchaseOrderFormData = z.infer<typeof PurchaseOrderValidator>;

export type PurchaseFormProps = {
  defaultValues: PurchaseOrderDTO | null;
  departments: DepartmentDTO[];
  fuels: FuelDTO[];
};
export type ItemDraft = {
  fuelId: string;
  fuelName: string;
  unit: string;
  oldQty: number;
  newQty: number;
};
export type OrderDraft = {
  orderId: string;
  reference: string;
  items: ItemDraft[];
};
export type SidebarStatus = "pending" | "queued" | "kept" | "success" | "error";

export interface SidebarEntry {
  orderId: string;
  reference: string;
  status: SidebarStatus;
  items?: ItemDraft[];
  errorMsg?: string;
}

export interface PurchaseOrderUpdateProps {
  orders: PurchaseOrderDTO[];
}

export interface PurchaseOrderUpdateHeaderProps {
  reviewed: number;
  total: number;
}

export interface PurchaseOrderUpdateOrderCardProps {
  order: PurchaseOrderDTO;
  draft: PurchaseOrderDTO;
  index: number;
  total: number;
  status: SidebarStatus;
  onQtyChange: (itemIndex: number, value: number) => void;
  onKeep: () => void;
  onAdd: () => void;
}

export interface PurchaseOrderUpdateBatchActionProps {
  queueCount: number;
  keptCount: number;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export interface PurchaseOrderUpdateSidebarEntryProps {
  entry: SidebarEntry;
  isCurrent: boolean;
  onClick: () => void;
}

export interface PurchaseOrderUpdateOrderSidebarProps {
  entries: SidebarEntry[];
  currentIndex: number;
  onNavigate: (idx: number) => void;
}
