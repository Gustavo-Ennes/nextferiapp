export type PdfPreviewTypeProp =
  | "vacation"
  | "materialRequisition"
  | "vehicleUsage"
  | "materialRequisition";

export type PdfPreviewProps = {
  data?: any;
  _id?: string;
  type?: PdfPreviewTypeProp;
};

export type PdfPreviewType = {
  setPdf: (params: PdfPreviewProps) => void;
};

export type AlertSeverity = "info" | "success" | "warning" | "error";

export type SnackbarData = {
  message: string;
  severity?: AlertSeverity;
};
