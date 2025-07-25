import { PDFPage, TextAlignment, layoutMultilineText } from "pdf-lib";
import { range } from "ramda";

import Boss from "@/models/Boss";
import type {
  Vacation as VacationInterface,
  Boss as BossInterface,
} from "@/app/types";
import { GetMultiTextWidthParam } from "./types";

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
    { height: 0, width: 0 }
  );
};

const sumMapUntil = (arr: number[], index: number) =>
  arr.reduce(
    (sum, actual, reduceIndex) => (reduceIndex < index ? sum + actual : sum),
    0
  );

const calculateCellRealWidth = (
  columnsXArray: number[],
  index: number,
  startX: number
) =>
  index > 0
    ? columnsXArray[index] - columnsXArray[index - 1]
    : columnsXArray[index] - startX;

// type vacation envolves money to the worker, so director sign, others not
const getBoss = async (
  vacation?: VacationInterface
): Promise<BossInterface | null> => {
  const isDirector = vacation?.type === "normal" || vacation?.type === "vacation";
  return await Boss.findOne({ isDirector }).exec();
};

export {
  getBoss,
  getHeightObject,
  getMultiTextMeasures,
  sumMapUntil,
  calculateCellRealWidth,
};
