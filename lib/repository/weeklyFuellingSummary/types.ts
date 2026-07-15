import type { PdfPreviewItem } from "@/context/types";

export interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

export interface PdfData {
  items: PdfPreviewItem[];
  opened: boolean;
}

export interface LocalStorageData {
  pdfData: PdfData;
  lastPage?: string;
}
