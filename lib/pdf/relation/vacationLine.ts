import { format } from "date-fns";
import { PDFDocument, PDFFont } from "pdf-lib";

import type { Vacation } from "@/app/types";
import { createParagraph } from "../factory";
import type { Height } from "../types";
import { getRelationItemText } from "./data";

const drawVacationRelationLine = async ({
  document,
  font,
  height,
  index,
  vacation,
}: {
  vacation: Vacation;
  document: PDFDocument;
  height: Height;
  font: PDFFont;
  index: number;
}) =>
  await createParagraph({
    document,
    font,
    fontSize: 14,
    height,
    text: getRelationItemText({
      formatedDate: format(vacation.startDate, "dd/MM/yyyy"),
      index,
      vacation: vacation,
    }),
  });

export { drawVacationRelationLine };
