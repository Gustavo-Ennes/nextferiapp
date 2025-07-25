import { sum } from "ramda";

import { GetMultiTextWidthParam } from "./types";
import { getMultiTextMeasures } from "./utils";

const calculateColumnsXArray = (textParams: GetMultiTextWidthParam) => {
  const collsWidth: number[] = [];
  const { data, maxColumnWidth, page, startX } = textParams;
  const defaultCollumnMaxWidth = maxColumnWidth ?? page.getWidth() - 70;
  const collumnsWidthDifference: number[] = [];

  if (data?.[0]) {
    for (let i = 0; i < data[0].length; i++) {
      let collumnMaxWidth = 0;
      for (let j = 0; j < data.length; j++) {
        const text = data[j][i];
        const { width: rawWidth } = getMultiTextMeasures({
          ...textParams,
          text,
        });
        // width with borders
        const width = rawWidth * 1.3;

        if (width > collumnMaxWidth) collumnMaxWidth = width;
      }

      const collumnWidth =
        collumnMaxWidth < defaultCollumnMaxWidth
          ? collumnMaxWidth
          : defaultCollumnMaxWidth;
      const lastCellEndX = collsWidth[collsWidth.length - 1] ?? startX;
      collumnsWidthDifference.push(defaultCollumnMaxWidth - collumnWidth);
      collsWidth.push(lastCellEndX + collumnWidth);
    }

    const totalCollumnsWidthDifference = sum(collumnsWidthDifference);
    const widthToIncreaseInEachCell =
      totalCollumnsWidthDifference / collsWidth.length;

    collsWidth.forEach((_, index) => {
      for (let i = index; i < collsWidth.length; i++) {
        collsWidth[i] += widthToIncreaseInEachCell;
      }
    });
  }
  return collsWidth;
};

const getTableInfo = (textParams: GetMultiTextWidthParam) => ({
  columnsXArray: calculateColumnsXArray(textParams),
  //   data,
  //   height: calculateTableHeight(y, data),
  //   linesYArray: calculateLinesYArray(y, data),
  //   textPositionArray: calculateTextPosition(x, y, data),
  //   width: calculateTableWidth(x, data),
  x: textParams.x,
  y: textParams.y,
});

export { getTableInfo };
