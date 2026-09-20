import type {
  FuelDTO,
  FuelingBatchDTO,
  FuelingBatchDTODepartment,
  FuelingBatchDTOVehicle,
} from "@/dto";
import type { FuelingBatchFueling } from "@/models/types";
import type { MouseEvent, RefObject, SetStateAction } from "react";

export type PdfPreviewTypeProp =
  | "vacation"
  | "vehicleUsage"
  | "cancellation"
  | "fuelingBatch"
  | "purchaseOrder";

export type PdfPreviewItem = {
  data?: FuelingBatchDTO;
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
  openSelectDialog: (data: DialogOptions) => void;
  closeSelectDialog: () => void;
  confirmationDialogData: DialogOptions | null;
  inputDialogData: DialogOptions | null;
  carDetailDialogData: DialogOptions | null;
  selectDialogData: DialogOptions | null;
};

export type DialogOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirmAction: (input?: string) => Promise<void> | void;
  onCloseAction?: () => Promise<void> | void;
  openState?: boolean;
  input?: string;
  inputLabel?: string;
  vehicle?: FuelingBatchDTOVehicle;
  options?: { label: string; value: string }[];
  selectedOption?: string;
  role?: "dialog" | "alertDialog";
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

export type FuelingBatchFormContextValues = {
  selectedDepartment: FuelingBatchDTODepartment | null;
  setSelectedDepartment: (value: FuelingBatchDTODepartment | null) => void;
  selectedCar: FuelingBatchDTOVehicle | null;
  setSelectedCar: (value: FuelingBatchDTOVehicle | null) => void;
  vehicleForm: VehicleForm;
  setVehicleForm: (form: VehicleForm) => void;
  date: string;
  setDate: (value: string) => void;
  quantity: number;
  setQuantity: (value: number) => void;
  kmHr: number | null;
  setKmHr: (value: number | null) => void;
  totalValue: number;
  totalLiters: number;
  totalKmHrs: number;
  lastKm: number | null;
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

export type VehicleForm = {
  description: string;
  prefix: number;
  fuel: FuelDTO | string;
  fuelings: FuelingBatchFueling[];
};
