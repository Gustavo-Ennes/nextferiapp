import {
  PDFDocument,
  PDFPage,
  TextAlignment,
  charAtIndex,
  cleanText,
  layoutMultilineText,
  mergeLines,
  type CombedTextLayout,
  type LayoutCombedTextOptions,
  type LayoutSinglelineTextOptions,
  type SinglelineTextLayout,
  type TextPosition,
} from "pdf-lib";
import { range, slice, takeLast } from "ramda";

import type { GetMultiTextWidthParam } from "./types";
import type { BossDTO, VacationDTO, WorkerDTO } from "@/dto";
import type {
  PurchaseOrderDTO,
  PurchaseOrderItemDTO,
} from "@/dto/PurchaseOrderDTO";
import {
  DEPTS_WITH_NOTE,
  EDUCACAO_NOTE,
  TRANSPORTE_NOTE,
} from "./purchaseOrder/constants";

const getHeightObject = (page: PDFPage) => ({
  actual: page.getHeight() - 80,
  stepHugeLine() {
    this.actual -= 28;
  },
  stepLine() {
    this.actual -= 20;
  },
  stepLines(linesQtd: number, type = "regular") {
    const size = type === "regular" ? 20 : 28;
    range(0, linesQtd).forEach(() => {
      this.actual -= size;
    });
  },
  stepSmallLine() {
    this.actual -= 12;
  },
});

const getMultiTextMeasures = ({
  font,
  fontSize,
  lineHeight,
  maxWidth,
  page,
  text,
  x,
  y,
}: GetMultiTextWidthParam) => {
  const multiText = layoutMultilineText(text ?? "", {
    alignment: TextAlignment.Center,
    bounds: {
      height: page.getHeight(),
      width: maxWidth ?? page.getWidth() - x * 2,
      x,
      y,
    },
    font,
    fontSize,
  });
  return multiText.lines.reduce(
    (measures, { text }) => {
      const paragraphWidth = font.widthOfTextAtSize(text, fontSize);
      measures.width =
        paragraphWidth > measures.width ? paragraphWidth : measures.width;
      measures.height += lineHeight;
      return measures;
    },
    { height: 0, width: 0 },
  );
};

const sumMapUntil = (arr: number[], index: number) =>
  arr.reduce(
    (sum, actual, reduceIndex) => (reduceIndex < index ? sum + actual : sum),
    0,
  );

const calculateCellRealWidth = (
  columnsXArray: number[],
  index: number,
  startX: number,
) =>
  index > 0
    ? columnsXArray[index] - columnsXArray[index - 1]
    : columnsXArray[index] - startX;

// type vacation envolves money to the worker, so director sign, others not
const getBoss = async (vacation?: VacationDTO): Promise<BossDTO | null> => {
  const { BossRepository } = await import("@/lib/repository/boss/boss");

  return await BossRepository.findOne({
    id: vacation?.boss as string,
  });
};

const getWorker = async (boss?: BossDTO): Promise<WorkerDTO | null> => {
  const { WorkerRepository } = await import("@/lib/repository/worker/worker");

  return await WorkerRepository.findOne({
    id: (boss?.worker as WorkerDTO)._id,
  });
};

const formatMatriculation = (matriculation?: string): string => {
  if (!matriculation) return "";

  const lastDigit = takeLast(1, matriculation);
  const middleDigits = slice(
    matriculation.length - 4,
    matriculation.length - 1,
    matriculation,
  );
  const firstDigits = slice(0, matriculation.length - 4, matriculation);

  return `${firstDigits}.${middleDigits}-${lastDigit}`;
};

const getFuelName = (item: PurchaseOrderItemDTO): string => {
  if (typeof item.fuel === "string") return item.fuel;
  return item.fuel.name ?? "—";
};

const getDepartmentName = (order: PurchaseOrderDTO): string => {
  if (typeof order.department === "string") return order.department;
  return (order.department as any).name ?? "—";
};

const formatBRL = (value: number): string => {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const formatQuantity = (qty: number): string => {
  return qty.toLocaleString("pt-BR") + " L";
};

const addPage = async (doc: PDFDocument): Promise<PDFPage> => {
  return doc.addPage();
};

const layoutCombedText = (
  text: string,
  { fontSize, font, bounds, cellCount }: LayoutCombedTextOptions,
): CombedTextLayout => {
  const line = mergeLines(cleanText(text));

  if (line.length > cellCount) {
    throw new Error(
      `Error in rendering purchase PDF: line height: ${line.length}, cellCount: ${cellCount}`,
    );
  }

  if (fontSize === undefined || fontSize === 0) {
    fontSize = 20;
  }

  const cellWidth = bounds.width / cellCount;

  const height = font.heightAtSize(fontSize, { descender: false });
  const y = bounds.y + (bounds.height / 2 - height / 2);

  const cells: TextPosition[] = [];

  let minX = bounds.x;
  let minY = bounds.y;
  let maxX = bounds.x + bounds.width;
  let maxY = bounds.y + bounds.height;

  let cellOffset = 0;
  let charOffset = 0;
  while (cellOffset < cellCount) {
    const [char, charLength] = charAtIndex(line, charOffset);

    const encoded = font.encodeText(char);
    const width = font.widthOfTextAtSize(char, fontSize);

    const cellCenter = bounds.x + (cellWidth * cellOffset + cellWidth / 2);
    const x = cellCenter - width / 2;

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + width > maxX) maxX = x + width;
    if (y + height > maxY) maxY = y + height;

    cells.push({ text: line, encoded, width, height, x, y });

    cellOffset += 1;
    charOffset += charLength;
  }

  return {
    fontSize,
    cells,
    bounds: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    },
  };
};

export const layoutSinglelineText = (
  text: string,
  { alignment, fontSize, font, bounds }: LayoutSinglelineTextOptions,
): SinglelineTextLayout => {
  const line = mergeLines(cleanText(text));

  if (fontSize === undefined || fontSize === 0) {
    fontSize = 20;
  }

  const encoded = font.encodeText(line);
  const width = font.widthOfTextAtSize(line, fontSize!);
  const height = font.heightAtSize(fontSize!, { descender: false });

  // prettier-ignore
  const x = (
      alignment === TextAlignment.Left   ? bounds.x
    : alignment === TextAlignment.Center ? bounds.x + (bounds.width / 2) - (width / 2)
    : alignment === TextAlignment.Right  ? bounds.x + bounds.width - width
    : bounds.x
  );

  const y = bounds.y + (bounds.height / 2 - height / 2);

  return {
    fontSize,
    line: { text: line, encoded, width, height, x, y },
    bounds: { x, y, width, height },
  };
};

const defineOrderItemNote = ({ deptName }: { deptName: string }) => {
  if (!DEPTS_WITH_NOTE.includes(deptName)) return;

  return deptName === "Educação 2" ? EDUCACAO_NOTE : TRANSPORTE_NOTE;
};

export {
  getBoss,
  getHeightObject,
  getMultiTextMeasures,
  sumMapUntil,
  calculateCellRealWidth,
  getWorker,
  formatMatriculation,
  addPage,
  formatQuantity,
  formatBRL,
  getDepartmentName,
  getFuelName,
  layoutCombedText,
  defineOrderItemNote,
};
