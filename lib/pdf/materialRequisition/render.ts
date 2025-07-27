import { StandardFonts } from "pdf-lib";

import {
  createHeader,
  createParagraph,
  createSign,
  createTable,
  createTitle,
} from "../factory";
import { MaterialRequisitionDrawBlockParam, RenderParam } from "../types";
import { getHeightObject } from "../utils";
import { materialRequisitionData } from "./data";

const drawBlock = async ({
  document,
  font,
  fontSize,
  headerY,
  height,
  page,
}: MaterialRequisitionDrawBlockParam) => {
  const departmentText =
    "SETOR REQUISITANTE: _________________________________________________________";
  const applicationText =
    "VEÍCULO/EQUIP.: ______________________________________ PREFIXO/BP: ____________";
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
    x: page.getWidth() / 2 - getParagraphWidth(applicationText, 12) / 2,
  });

  height.stepLine();

  await createParagraph({
    document,
    font,
    fontSize,
    height,
    maxWidth: page.getWidth() - 70,
    text: applicationText,
    x: page.getWidth() / 2 - getParagraphWidth(applicationText, 12) / 2,
  });

  height.stepLine();

  await createTable({
    data: materialRequisitionData,
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
};

const render = async ({ document }: RenderParam): Promise<void> => {
  if (document) {
    const page = document.addPage();
    const height = getHeightObject(page);
    const font = await document.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    await drawBlock({ document, font, fontSize, height, page });
    height.stepLines(3, "regular")
    await drawBlock({
      document,
      font,
      fontSize,
      headerY: height.actual,
      height,
      page,
    });
  }
};

export { render };
