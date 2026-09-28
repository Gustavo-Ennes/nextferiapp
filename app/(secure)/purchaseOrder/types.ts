import type z from "zod";
import type { PurchaseOrderValidator } from "@/lib/validators/purchaseOrder";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import type { DepartmentDTO, SupplierDTO } from "@/dto";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { Dispatch, RefObject, SetStateAction } from "react";

export type PurchaseOrderFormData = z.infer<typeof PurchaseOrderValidator>;

export type PurchaseFormProps = {
  defaultValues: PurchaseOrderDTO | null;
  departments: DepartmentDTO[];
  fuels: FuelDTO[];
  suppliers: SupplierDTO[];
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
  suppliers: SupplierDTO[];
}

export interface PurchaseOrderUpdateHeaderProps {
  reviewed: number;
  total: number;
  suppliers: SupplierDTO[];
  setSupplier: Dispatch<SetStateAction<string>>;
  selectedSupplier: string;
}

export interface PurchaseOrderUpdateOrderCardProps {
  order: PurchaseOrderDTO;
  draft: PurchaseOrderDTO;
  index: number;
  total: number;
  status: SidebarStatus;
  inputRefs: Record<string, RefObject<HTMLInputElement | null>>;
  lowBalanceFilter: boolean;
  outdatedFilter: boolean;
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
  setLowBalance: Dispatch<SetStateAction<boolean>>;
  setOutdated: Dispatch<SetStateAction<boolean>>;
}
