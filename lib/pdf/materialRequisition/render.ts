import { PDFPage, StandardFonts } from "pdf-lib";

import {
  createHeader,
  createParagraph,
  createSign,
  createTable,
  createTitle,
} from "../factory";
import {
  Height,
  MaterialRequisitionDrawBlockParam,
  RenderParam,
} from "../types";
import { getHeightObject } from "../utils";
import { materialRequisitionData } from "./data";
import { parseMaterialRequisitionData } from "./utils";
import { splitEvery } from "ramda";

const BLOCK_MAX_LINES = 10;

const drawBlock = async ({
  document,
  font,
  fontSize,
  headerY,
  height,
  page,
  data,
  tabData,
}: MaterialRequisitionDrawBlockParam) => {
  const departmentText = `SETOR REQUISITANTE:  - ${tabData.department} - `;
  const applicationText = `VEÍCULO/EQUIP.:  - ${data.vehicle} - `;
  const prefixText = `PREFIX/B.P.: - #${data.prefix}`;
  const MARGIN_SIZE = 33;

  const getParagraphWidth = (text: string, size = 15) =>
    font.widthOfTextAtSize(text, size);

  await createHeader(document, headerY);
  // padding from the middle page header
  if (headerY) {
    height.stepHugeLine();
  }

  await createTitle({
    document,
    height,
    size: 20,
    title: "REQUISIÇÃO DE MATERIAIS - Combustível",
  });

  height.stepHugeLine();

  await createParagraph({
    document,
    font,
    fontSize,
    height,
    maxWidth: page.getWidth() - 70,
    text: departmentText,
    // x: page.getWidth() / 2 - getParagraphWidth(applicationText, 12) / 2,
    x: MARGIN_SIZE,
  });

  height.stepLine();

  await createParagraph({
    document,
    font,
    fontSize,
    height,
    maxWidth: page.getWidth() - 70,
    text: applicationText,
    x: MARGIN_SIZE,
  });

  await createParagraph({
    document,
    font,
    fontSize,
    height,
    maxWidth: page.getWidth() - 70,
    text: prefixText,
    x: page.getWidth() - MARGIN_SIZE - getParagraphWidth(prefixText, 12) - 5,
  });

  height.stepLine();

  await createTable({
    data: parseMaterialRequisitionData(data),
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

  height.stepLine();

  const dateSlots = "____/____/_____";
  await createParagraph({
    document,
    font,
    fontSize,
    height,
    maxWidth: page.getWidth() - 70,
    text: dateSlots,
    x: page.getWidth() / 6 - getParagraphWidth(dateSlots, 12) / 2,
  });
  await createParagraph({
    document,
    font,
    fontSize,
    height,
    maxWidth: page.getWidth() - 70,
    text: dateSlots,
    x: (page.getWidth() / 6) * 3 - getParagraphWidth(dateSlots, 12) / 2,
  });
  await createParagraph({
    document,
    font,
    fontSize,
    height,
    maxWidth: page.getWidth() - 70,
    text: dateSlots,
    x: (page.getWidth() / 6) * 5 - getParagraphWidth(dateSlots, 12) / 2,
  });

  height.stepHugeLine();

  await createSign({
    document,
    height,
    name: "REQUISITANTE",
    role: "",
    x: page.getWidth() / 6,
  });
  await createSign({
    document,
    height,
    name: "APROVAÇÃO DO SETOR",
    role: "",
    x: (page.getWidth() / 6) * 3,
  });
  await createSign({
    document,
    height,
    name: "ALMOXARIFADO",
    role: "",
    x: (page.getWidth() / 6) * 5,
  });
  height.stepHugeLine();

  console.log(`Drawed a block for #${data.prefix}.`);
};

const render = async ({ document, data }: RenderParam): Promise<void> => {
  try {
    if (document && data?.length) {
      const font = await document.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;
      let headerY: number | undefined;
      let blockCounter = 0;
      let page = document.addPage();
      let height = getHeightObject(page);

      for (const tabData of data) {
        const carEntries = tabData.carEntries ?? [];

        for (const carEntry of carEntries) {
          // spliting the fuelings by chuncks of 10(max lines in block, start new at 11)
          const carFuelingsInChunksOfTen = splitEvery(
            BLOCK_MAX_LINES,
            carEntry.fuelings
          );
          for (const tenFuelingBlock of carFuelingsInChunksOfTen) {
            if (blockCounter > 0 && blockCounter % 2 === 0) {
              page = document.addPage();
              height = getHeightObject(page);
              headerY = undefined;
              console.log(`page added: #${document.getPageCount()}`);
            } else if (blockCounter > 0 && blockCounter % 2 > 0) {
              height.stepLines(3, "regular");
              headerY = height.actual;
              console.log(
                `second block added to page #${document.getPageCount()}`
              );
            }

            await drawBlock({
              document,
              font,
              fontSize,
              height,
              headerY,
              page,
              data: { ...carEntry, fuelings: tenFuelingBlock },
              tabData,
            });
            blockCounter++;
            console.log("🚀 ~ render ~ blockCounter:", blockCounter);
          }
        }
      }
    }
  } catch (error) {
    console.log("🚀 ~ MATERIALREQUISITION render ~ error:", error);
  }

  // await drawBlock({
  //   document,
  //   font,
  //   fontSize,
  //   headerY: height.actual, VER PQ DISSO
  //   height,
  //   page,
  //   data,
  // });
};

export { render };
