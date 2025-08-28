import type { TabData } from "@/app/(secure)/materialRequisition/types";

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


export type ModalContextType = {
  open: (options: ModalOptions) => void;
  close: () => void;
};

export type ModalOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  input?: boolean;
  onConfirm: (observation: string) => Promise<void>;
};
