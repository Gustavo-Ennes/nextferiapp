import { TabData } from "@/app/(secure)/materialRequisition/types";

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
  setPdf: (items: PdfPreviewItem[]) => void;
};

export type AlertSeverity = "info" | "success" | "warning" | "error";

export type SnackbarData = {
  message: string;
  severity?: AlertSeverity;
};
