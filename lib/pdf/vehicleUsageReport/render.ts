import { PageSizes, StandardFonts } from "pdf-lib";

import {
  createPageHeaderHorizontal,
  createParagraph,  
  createTable,
  createTitle,
} from "../factory";
import type { RenderParam } from "../types";
import { getHeightObject } from "../utils";
import { fuelingTableData, vehicleUsageTableData } from "./data";

const render = async ({ document }: RenderParam): Promise<void> => {
  if (document) {
    const page = document.addPage([PageSizes.A4[1], PageSizes.A4[0]]);
    const height = getHeightObject(page);
    const font = await document.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    height.actual += 40;

    await createPageHeaderHorizontal(document);
    await createTitle({
      document,
      height,
      offset: 250,
      size: 15,
      title: "Boletim de utilização de veículo",
    });

    height.stepHugeLine();

    const paragraphText =
      "PLACA:______________ PREFIXO:______________ MÊS:______________ ANO:______________";
    const paragraphWidth = font.widthOfTextAtSize(paragraphText, 15);
    await createParagraph({
      document,
      font,
      fontSize: 15,
      height,
      text: paragraphText,
      x: (page.getWidth() - 35) / 2 - paragraphWidth / 2 - 5,
    });

    height.stepLine();

    await createTable({
      data: vehicleUsageTableData,
      document,
      endLineX: page.getWidth() - 35,
      font,
      fontSize,
      height,
      lineHeight: 20,
      page,
      startLineX: 35,
      startY: height.actual,
    });
    height.stepLine();

    const fuelingText = "ABASTECIMENTO";
    const fuelingTextWidth = font.widthOfTextAtSize(fuelingText, 15);
    const fuelingTextX = (page.getWidth() - 35) / 2 - fuelingTextWidth / 4;
    page.drawText("ABASTECIMENTO", {
      font,
      size: 15,
      x: fuelingTextX,
      y: height.actual,
    });

    height.stepSmallLine();

    await createTable({
      data: fuelingTableData,
      document,
      endLineX: page.getWidth() - 35,
      font,
      fontSize,
      height,
      lineHeight: 18,
      page,
      startLineX: 35,
      startY: height.actual,
    });

    height.stepSmallLine();

    await createTable({
      data: fuelingTableData,
      document,
      endLineX: page.getWidth() - 35,
      font,
      fontSize,
      height,
      lineHeight: 18,
      page,
      startLineX: 35,
      startY: height.actual,
    });
  }
};

export { render };
