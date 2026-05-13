import {
  PDFDocument,
  StandardFonts,
  TextAlignment,
  layoutMultilineText,
  rgb,
} from "pdf-lib";

import type {
  CreateParagraphParams,
  CreateSignParams,
  CreateTitleParams,
  DrawCellFnParams,
  DrawLineParam,
  DrawPurchaseOrderSectionHeaderParam,
  TableParams,
} from "./types";

import { getTableInfo } from "./table";
import {
  addPage,
  calculateCellRealWidth,
  formatBRL,
  formatMatriculation,
  formatQuantity,
  getMultiTextMeasures,
} from "./utils";
import { translateVacationPeriod } from "./vacation/utils";
import { capitalizeName } from "@/app/utils";
import {
  LINE_HEIGHT,
  SECTION_GAP,
  MARGIN_X,
  PAGE_WIDTH,
  ITEM_INDENT,
  SAFE_BOTTOM,
  SAFE_TOP,
} from "./purchaseOrder/constants";
import type { Height } from "./types";

const getFont = async (document: PDFDocument) =>
  document.embedFont(StandardFonts.Helvetica);
const getBoldFont = async (document: PDFDocument) =>
  document.embedFont(StandardFonts.HelveticaBold);

const createHeader = async (
  document: PDFDocument,
  y?: number,
): Promise<void> => {
  const header =
    "https://storage.googleapis.com/feriappjs/novo-header-pref.png";
  const headerBuffer = await fetch(header).then((res) => res.arrayBuffer());
  const pngHeaderImage = await document.embedPng(headerBuffer);
  const pngHeaderDims = pngHeaderImage.scale(0.7);
  const page = document.getPage(document.getPageCount() - 1);

  page.drawImage(pngHeaderImage, {
    height: pngHeaderDims.height,
    opacity: 1,
    width: pngHeaderDims.width,
    x: 60,
    y: y ?? page.getHeight() - 60,
  });
};

const createPageHeaderHorizontal = async (
  document: PDFDocument,
): Promise<void> => {
  const header =
    "https://storage.googleapis.com/feriappjs/novo-header-pref.png";
  const headerBuffer = await fetch(header).then((res) => res.arrayBuffer());
  const pngHeaderImage = await document.embedPng(headerBuffer);
  const pngHeaderDims = pngHeaderImage.scale(0.65);
  const page = document.getPage(document.getPageCount() - 1);

  page.drawImage(pngHeaderImage, {
    height: pngHeaderDims.height,
    opacity: 1,
    width: pngHeaderDims.width,
    x: 30,
    y: page.getHeight() - 50,
  });
};

const createFooter = async (document: PDFDocument): Promise<void> => {
  const footer =
    "https://storage.googleapis.com/feriappjs/novo-footer-pref.png";
  const footerBuffer = await fetch(footer).then((res) => res.arrayBuffer());
  const pngFooterImage = await document.embedPng(footerBuffer);
  const pngFooterDims = pngFooterImage.scale(0.7);
  const page = document.getPage(document.getPageCount() - 1);

  page.drawImage(pngFooterImage, {
    height: pngFooterDims.height,
    opacity: 1,
    width: pngFooterDims.width,
    x: 70,
    y: 10,
  });
};

const createTitle = async ({
  document,
  height,
  offset = 0,
  size = 24,
  title,
}: CreateTitleParams): Promise<void> => {
  const font = await getFont(document);
  const textWidth = font.widthOfTextAtSize(title.toUpperCase(), size);
  const page = document.getPage(document.getPageCount() - 1);
  const { width } = page.getSize();
  const xCoordinate = width / 2 - textWidth / 2 + offset;

  // title
  page.drawText(title.toUpperCase(), {
    size,
    x: xCoordinate,
    y: height.actual,
  });
};

const createParagraph = async ({
  document,
  font,
  fontSize = 14,
  height,
  lineHeight = 15,
  maxWidth,
  text,
  x = 50,
  y = height.actual,
  color = { r: 0.25, g: 0.25, b: 0.25 },
}: CreateParagraphParams): Promise<void> => {
  const page = document.getPage(document.getPageCount() - 1);
  const multiText = layoutMultilineText(text, {
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

  const { r, g, b } = color;
  const rgbColor = rgb(r, g, b);
  multiText.lines.forEach((line) => {
    page.drawText(line.text, {
      font,
      lineHeight,
      maxWidth: maxWidth ?? page.getWidth() - x * 2,
      size: fontSize,
      x,
      y,
      color: rgbColor,
    });
    y -= lineHeight;
  });
};

const createSign = async ({
  document,
  height,
  matriculation,
  name,
  role,
  worker,
  x = 300,
}: CreateSignParams): Promise<void> => {
  const page = document.getPage(document.getPageCount() - 1);
  const matriculationText = `Matr.: ${formatMatriculation(matriculation)}`;
  const regularFont = await getFont(document);
  const boldFont = await getBoldFont(document);
  const regularFontSize = 12;
  const boldFontSize = regularFontSize * 1.1;
  const textLines = [
    "_____________________",
    capitalizeName(name ?? worker?.name ?? "excluído"),
    role ?? "",
  ];
  const maxWidth = page.getWidth();
  const lineHeight = 15;
  const NAME_TEXT_LINE_INDEX = 1;
  let y = height.actual;

  if (matriculation) textLines.push(matriculationText);

  textLines.forEach((line, index) => {
    const font = index === NAME_TEXT_LINE_INDEX ? boldFont : regularFont;
    const fontSize =
      index === NAME_TEXT_LINE_INDEX ? boldFontSize : regularFontSize;
    const textWidth = font.widthOfTextAtSize(line, fontSize);

    page.drawText(line, {
      font,
      lineHeight,
      maxWidth,
      size: fontSize,
      x: x - textWidth / 2,
      y,
    });
    y -= lineHeight;
  });
};

const createDuration = async ({
  duration,
  document,
  height,
  period,
}: {
  document: PDFDocument;
  duration: number;
  height: Height;
  period: string;
}): Promise<void> => {
  const text =
    duration <= 1 ? `${translateVacationPeriod(period)}` : `${duration} dias`;
  const offset = 20;
  drawTopRightText({ document, fontSize: 12, height, offset, text });
};

const drawTopRightText = ({
  document,
  fontSize = 11,
  height,
  offset = 0,
  text,
}: {
  height: Height;
  document: PDFDocument;
  text: string;
  fontSize?: number;
  offset?: number;
}) => {
  const page = document.getPage(document.getPageCount() - 1);
  page.drawText(text, {
    size: fontSize,
    x: page.getWidth() - 100 - offset,
    y: height.actual + 10,
  });
};

const drawTableLine = async ({
  columnsXArray,
  document,
  endLineX,
  font,
  height,
  line,
  lineHeight,
  page,
  startLineX,
}: DrawCellFnParams) => {
  const defaultCellWidth = (endLineX - startLineX) / line.length;
  const getCellCenterX = (
    textWidth: number,
    cellEndX: number,
    cellWidth?: number,
  ) => cellEndX - (cellWidth ?? defaultCellWidth) / 2 - textWidth / 2;
  const startHeight = height.actual;
  const fontSize = 11;
  let highestCellSize = 22;

  // cell upper line
  page.drawLine({
    end: { x: endLineX, y: height.actual },
    start: { x: startLineX, y: height.actual },
  });

  // goto middle to write
  height.actual -= lineHeight * 0.7;

  line.forEach(async (cell, index) => {
    if (cell) {
      const cellRealWidth = calculateCellRealWidth(
        columnsXArray,
        index,
        startLineX,
      );
      const { height: paragraphHeight, width: paragraphWidth } =
        getMultiTextMeasures({
          font,
          fontSize,
          lineHeight,
          maxWidth: cellRealWidth * 0.7,
          page,
          text: cell,
          x: startLineX,
          y: height.actual,
        });
      const newX = getCellCenterX(
        paragraphWidth,
        columnsXArray[index],
        cellRealWidth,
      );

      if (paragraphHeight > highestCellSize) highestCellSize = paragraphHeight;
      await createParagraph({
        document,
        font,
        fontSize,
        height,
        lineHeight,
        maxWidth: cellRealWidth * 0.7,
        text: cell,
        x: newX,
      });
    }
  });

  height.actual -= highestCellSize * 0.2;
  // each cell (except first) draws a vertical line in x1 point
  line.forEach((_, index) => {
    const x = columnsXArray[index];
    if (index >= 0)
      page.drawLine({
        end: { x, y: startHeight },
        start: { x, y: height.actual },
      });
  });
};

const createTable = async ({
  data,
  document,
  endLineX,
  font,
  fontSize,
  height,
  lineHeight = 8,
  page,
  startLineX,
  startY,
}: TableParams): Promise<void> => {
  const maxColumnWidth = (endLineX - startLineX) / data[0].length;
  const { columnsXArray } = getTableInfo({
    data,
    font,
    fontSize,
    lineHeight,
    maxColumnWidth,
    maxWidth: page.getWidth() - 70,
    page,
    startX: startLineX,
    x: 35,
    y: height.actual,
  });

  for (let i = 0; i < data.length; i++) {
    await drawTableLine({
      columnsXArray,
      data,
      document,
      endLineX,
      font,
      height,
      line: data[i],
      lineHeight,
      page,
      startLineX,
    });
  }
  page.drawLine({
    end: { x: endLineX, y: height.actual },
    start: { x: startLineX, y: height.actual },
  });
  page.drawLine({
    end: { x: startLineX, y: height.actual },
    start: { x: startLineX, y: startY },
  });
  page.drawLine({
    end: { x: endLineX, y: height.actual },
    start: { x: endLineX, y: startY },
  });
};

const drawLine = ({ y, x1, x2, document }: DrawLineParam): void => {
  const page = document.getPage(document.getPageCount() - 1);
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness: 0.5,
    color: { type: "RGB", red: 0.7, green: 0.7, blue: 0.7 } as any,
  });
};

const drawPurchaseOrderSectionHeader = async ({
  label,
  document,
  height,
}: DrawPurchaseOrderSectionHeaderParam): Promise<void> => {
  await ensureSpace({
    neededHeight: LINE_HEIGHT * 2 + SECTION_GAP,
    document,
    height,
  });
  height.actual -= SECTION_GAP;

  const page = document.getPage(document.getPageCount() - 1);
  const rectHeight = LINE_HEIGHT + 6;

  // fundo azul-escuro (cor do PDF de referência)
  page.drawRectangle({
    x: MARGIN_X,
    y: height.actual,
    width: PAGE_WIDTH - MARGIN_X * 2,
    height: rectHeight,
    color: { type: "RGB", red: 0.18, green: 0.35, blue: 0.52 } as any,
  });

  createParagraph({
    document,
    text: label.toUpperCase(),
    x: MARGIN_X + 6,
    y: height.actual + 5,
    height,
    font: await getFont(document),
    color: { r: 1, g: 1, b: 1 },
  });
};

const drawPurchaseOrderItem = async ({
  sequence,
  reference,
  quantity,
  price,
  height,
  document,
  note,
}: {
  sequence: number;
  reference: string;
  quantity: number;
  price: number;
  document: PDFDocument;
  height: Height;
  note?: string;
}): Promise<void> => {
  await ensureSpace({
    neededHeight: note ? LINE_HEIGHT * 2 : LINE_HEIGHT + 2,
    document,
    height,
  });

  const itemText = `${sequence}. Pedido ${reference}  -  ${formatQuantity(quantity)}  -  ${formatBRL(price)}`;

  createParagraph({
    document,
    text: itemText,
    x: MARGIN_X + ITEM_INDENT,
    y: height.actual,
    height,
    font: await getFont(document),
    fontSize: 11,
  });

  if (note) {
    height.stepSmallLine();
    createParagraph({
      document,
      text: note,
      x: MARGIN_X + ITEM_INDENT + 10,
      y: height.actual,
      height,
      font: await getFont(document),
      fontSize: 9,
    });
  }
};

const drawPurchaseOrderFuelSubtitle = async ({
  fuelName,
  document,
  height,
}: {
  fuelName: string;
  document: PDFDocument;
  height: Height;
}): Promise<void> => {
  await ensureSpace({ neededHeight: LINE_HEIGHT + 4, document, height });

  const fuelNameText = `- ${fuelName}`;

  createParagraph({
    document,
    x: MARGIN_X + 6,
    y: height.actual,
    height,
    font: await getFont(document),
    fontSize: 12,
    text: fuelNameText,
  });
};

const ensureSpace = async ({
  neededHeight,
  height,
  document,
}: {
  neededHeight: number;
  height: Height;
  document: PDFDocument;
}): Promise<void> => {
  if (height.actual - neededHeight < SAFE_BOTTOM) {
    await addPage(document!);
    await createHeader(document!);
    await createFooter(document!);
    height.actual = SAFE_TOP;
  }
};

export {
  createHeader,
  createFooter,
  createTitle,
  createParagraph,
  createSign,
  createDuration,
  createTable,
  drawTopRightText,
  createPageHeaderHorizontal,
  drawPurchaseOrderItem,
  ensureSpace,
  drawLine,
  drawPurchaseOrderSectionHeader,
  drawPurchaseOrderFuelSubtitle,
  getFont,
};
