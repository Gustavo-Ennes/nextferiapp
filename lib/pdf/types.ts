/* eslint-disable no-unused-vars */
import type { PDFDocument, PDFFont, PDFPage } from "pdf-lib";

import type {
  CarEntry,
  TabData,
} from "@/lib/repository/weeklyFuellingSummary/types";
import type { DepartmentDTO, VacationDTO, WorkerDTO } from "@/dto";
import type {
  PurchaseOrderDTO,
  PurchaseOrderItemDTO,
} from "@/dto/PurchaseOrderDTO";
import type { FuelDTO } from "@/dto/FuelDTO";

type LineData = (string | undefined)[];
type TableData = LineData[];
type Color = { r: number; g: number; b: number };

type Height = {
  actual: number;
  stepLine: () => void;
  stepHugeLine: () => void;
  stepLines: (lineQtd: number, type?: string) => void;
  stepSmallLine: () => void;
};

type RenderParam = {
  document?: PDFDocument;
  instance?: VacationDTO | WorkerDTO | DepartmentDTO | PurchaseOrderDTO | null;
  instances?:
    | VacationDTO[]
    | WorkerDTO[]
    | DepartmentDTO[]
    | PurchaseOrderDTO[]
    | null;
  reference?: Date;
  type?: string; // print type
  period?: string;
  data?: TabData[];
  fuels?: FuelDTO[];
};

type DrawCellFnParams = {
  columnsXArray: number[];
  height: Height;
  document: PDFDocument;
  line: LineData;
  page: PDFPage;
  font: PDFFont;
  startLineX: number;
  endLineX: number;
  lineHeight: number;
  data: TableData;
};

type CreatePdfParams = {
  name: string;
  // eslint-disable-next-line no-unused-vars
  pdfFn: (pdfFnParam: RenderParam) => Promise<void>;
  instance: VacationDTO | WorkerDTO;
};

type CreateTitleParams = {
  title: string;
  document: PDFDocument;
  height: Height;
  size?: number;
  offset?: number;
};

type CreateParagraphParams = {
  text: string;
  document: PDFDocument;
  height: Height;
  fontSize?: number;
  font: PDFFont;
  x?: number;
  y?: number;
  lineHeight?: number;
  maxWidth?: number;
  color?: Color;
};

type CreateSignParams = {
  document: PDFDocument;
  height: Height;
  name?: string;
  role: string;
  worker?: WorkerDTO;
  matriculation?: string;
  x?: number;
};

type DrawHalfPageParams = {
  height: Height;
  document: PDFDocument;
  vacation: VacationDTO;
  isDayOff?: boolean;
};

type TableParams = {
  data: TableData;
  document: PDFDocument;
  height: Height;
  page: PDFPage;
  startLineX: number;
  endLineX: number;
  startY: number;
  font: PDFFont;
  lineHeight?: number;
  fontSize: number;
};

type GetMultiTextWidthParam = {
  startX?: number;
  maxColumnWidth?: number;
  data?: TableData;
  text?: string;
  page: PDFPage;
  font: PDFFont;
  lineHeight: number;
  maxWidth: number;
  x: number;
  y: number;
  fontSize: number;
};

type GetTableInfoParam = {
  data: TableData;
  x: number;
  y: number;
};

type MaterialRequisitionDrawBlockParam = {
  document: PDFDocument;
  height: Height;
  font: PDFFont;
  fontSize: number;
  page: PDFPage;
  headerY?: number;
  data: CarEntry;
  tabData: TabData;
};

type DrawLineParam = {
  y: number;
  x1: number;
  x2: number;
  document: PDFDocument;
};

type DrawPurchaseOrderSectionHeaderParam = {
  label: string;
  document: PDFDocument;
  height: Height;
  color?: Color;
};


type OrderEntry = {
  items: PurchaseOrderItemDTO[];
  reference: string;
  note?: string;
};

type GroupedByFuel = Record<string, OrderEntry[]>;

type GroupedByDept = Record<string, GroupedByFuel>;

export type {
  CreateParagraphParams,
  CreatePdfParams,
  CreateSignParams,
  CreateTitleParams,
  DrawCellFnParams,
  DrawHalfPageParams,
  GetMultiTextWidthParam,
  GetTableInfoParam,
  Height,
  LineData,
  MaterialRequisitionDrawBlockParam,
  RenderParam,
  TableData,
  TableParams,
  DrawLineParam,
  DrawPurchaseOrderSectionHeaderParam,
  Color,
  GroupedByDept,
};
