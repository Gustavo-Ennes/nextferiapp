import type {
  CarEntry,
  FuelingData,
  FuelType,
  TabData,
} from "@/lib/repository/weeklyFuellingSummary/types";
import type { MouseEvent, RefObject, SetStateAction } from "react";

export type PdfPreviewTypeProp =
  | "vacation"
  | "materialRequisition"
  | "vehicleUsage"
  | "cancellation"
  | "materialRequisition";

export type PdfPreviewItem = {
  data?: TabData[];
  type?: PdfPreviewTypeProp;
  id?: string;
};

export type PdfPreviewType = {
  setPdf: (param: SetPdfCallbackParam) => void;
};

export type AlertSeverity = "info" | "success" | "warning" | "error";

export type SnackbarData = {
  message: string;
  severity?: AlertSeverity;
};

export type SetPdfCallbackParam = {
  items: PdfPreviewItem[];
  add?: boolean;
  open?: boolean;
};

export type DialogContextType = {
  openConfirmationDialog: (data: DialogOptions) => void;
  closeConfirmationDialog: () => void;
  openInputDialog: (data: DialogOptions) => void;
  closeInputDialog: () => void;
  openCarDetailDialog: (data: DialogOptions) => void;
  closeCarDetailDialog: () => void;
  confirmationDialogData: DialogOptions | null;
  inputDialogData: DialogOptions | null;
  carDetailDialogData: DialogOptions | null;
};

export type DialogOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (input?: string) => Promise<void> | void;
  onClose?: () => Promise<void> | void;
  openState?: boolean;
  input?: string;
  inputLabel?: string;
  car?: CarEntry;
};

export type OpenConfirmationDialogParam = {
  message: string;
  title: string;
  onConfirm: SetStateAction<(() => void | Promise<void>) | undefined>;
};

export interface DialogData {
  message: string;
  title: string;
  onConfirm: () => void;
}

export type MaterialRequisitionFormContextValues = {
  selectedTabData: TabData | null;
  setSelectedTabData: (value: TabData | null) => void;
  selectedCar: CarEntry | null;
  setSelectedCar: (value: CarEntry | null) => void;
  vehicle: string;
  setVehicle: (value: string) => void;
  prefix: number;
  setPrefix: (value: number) => void;
  fuel: FuelType;
  setFuel: (value: FuelType) => void;
  date: string;
  setDate: (value: string) => void;
  quantity: number;
  setQuantity: (value: number) => void;
  kmHr: number | null;
  setKmHr: (value: number | null) => void;
  fuelings: FuelingData[];
  setFuelings: (value: FuelingData[]) => void;
  hasUnsavedChanges: boolean;
  vehicleEquipInputRef: RefObject<HTMLInputElement | null>;
  dateInputRef: RefObject<HTMLInputElement | null>;
};

export type OpenDialogParams = {
  onConfirm: () => void;
  onCancel?: () => void;
  message: string;
  title: string;
};

export type DialogValues = {
  openDialog: (
    params: OpenDialogParams,
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => void;
};
