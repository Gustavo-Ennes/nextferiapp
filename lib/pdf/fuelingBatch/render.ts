import { StandardFonts } from "pdf-lib";

import {
  createHeader,
  createLabelValueParagraph,
  createParagraph,
  createSign,
  createTable,
  createTitle,
} from "../factory";
import type { FuelingBatchDrawBlockParam, RenderParam } from "../types";
import { getHeightObject } from "../utils";
import { parseFuelingBatchData } from "./utils";
import { splitEvery } from "ramda";
import { sortCarFuelings } from "@/lib/repository/fuelingBatch/utils";
import type { DepartmentDTO } from "@/dto/DepartmentDTO";
import { capitalizeName } from "@/app/utils";
import { format, toDate } from "date-fns";

const BLOCK_MAX_LINES = 10;

const drawBlock = async ({
  document,
  font,
  boldFont,
  fontSize,
  headerY,
  height,
  page,
  vehicle,
  summaryDepartment,
  date,
}: FuelingBatchDrawBlockParam) => {
  const prefixText = `PREFIX/B.P.: - #${vehicle.prefix}`;
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

  await createLabelValueParagraph({
    document,
    regularFont: font,
    boldFont,
    fontSize,
    height,
    maxWidth: page.getWidth() - 70,
    label: "SETOR REQUISITANTE",
    value: capitalizeName(
      (summaryDepartment.department as DepartmentDTO).name,
    ).toUpperCase(),
    x: MARGIN_SIZE,
  });

  height.stepLine();

  await createLabelValueParagraph({
    document,
    regularFont: font,
    boldFont,
    fontSize,
    height,
    maxWidth: page.getWidth() - 70,
    label: "VEÍCULO/EQUIP.",
    value: vehicle.vehicle.toUpperCase(),
    x: MARGIN_SIZE,
  });

  await createLabelValueParagraph({
    document,
    regularFont: font,
    boldFont,
    fontSize,
    height,
    maxWidth: page.getWidth() - 70,
    label: "PREFIXO",
    value: vehicle.prefix.toString(),
    x: page.getWidth() - MARGIN_SIZE - getParagraphWidth(prefixText, 12) - 5,
  });
  height.stepLine();

  await createTable({
    data: parseFuelingBatchData(vehicle),
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
    text: format(date, "dd / MM / yyyy"),
    x: (page.getWidth() / 6) * 3.1 - getParagraphWidth(dateSlots, 12) / 2,
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
};

const render = async ({ document, data }: RenderParam): Promise<void> => {
  try {
    if (document && data?.departments?.length) {
      const font = await document.embedFont(StandardFonts.Helvetica);
      const boldFont = await document.embedFont(StandardFonts.HelveticaBold);
      const fontSize = 12;
      let headerY: number | undefined;
      let blockCounter = 0;
      let page = document.addPage();
      let height = getHeightObject(page);

      for (const summaryDepartment of data.departments) {
        const carEntries = summaryDepartment.vehicles ?? [];

        for (const carEntry of carEntries) {
          // spliting the fuelings by chuncks of 10(max lines in block, start new at 11)
          const carFuelingsInChunksOfTen = splitEvery(
            BLOCK_MAX_LINES,
            sortCarFuelings(carEntry.fuelings ?? []),
          );
          for (const tenFuelingBlock of carFuelingsInChunksOfTen) {
            if (blockCounter > 0 && blockCounter % 2 === 0) {
              page = document.addPage();
              height = getHeightObject(page);
              headerY = undefined;
            } else if (blockCounter > 0 && blockCounter % 2 > 0) {
              height.stepLines(3, "regular");
              headerY = height.actual;
            }

            await drawBlock({
              document,
              font,
              boldFont,
              fontSize,
              height,
              headerY,
              page,
              vehicle: { ...carEntry, fuelings: tenFuelingBlock },
              summaryDepartment,
              date: toDate(data.updatedAt ?? data.createdAt),
            });
            blockCounter++;
          }
        }
      }
    }
  } catch (error) {
    console.error("~ FUELING BATCH render ~ error:", error);
  }
};

export { render };
