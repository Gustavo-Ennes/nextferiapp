import { StandardFonts } from "pdf-lib";

import type { Vacation } from "@/app/types";
import type { DrawHalfPageParams, RenderParam } from "../types";
import { capitalizeFirstLetter, capitalizeName } from "@/app/utils";
import {
  createDuration,
  createFooter,
  createHeader,
  createParagraph,
  createSign,
  createTitle,
} from "../factory";
import { getHeightObject, getBoss } from "../utils";
import { getParagraph, translateMonth, translateVacation } from "./utils";

const drawHalfPage = async ({
  document,
  height,
  vacation,
}: DrawHalfPageParams): Promise<void> => {
  const page = document.getPage(0);
  const paragraph = getParagraph(vacation);
  const font = await document.embedFont(StandardFonts.Helvetica);
  const vacationsDuration = (vacation.duration ?? vacation.daysQtd) as number;
  const vacationPeriod =
    vacation.period ?? (vacationsDuration < 1 ? "half" : "full");

  await createHeader(document);
  await createFooter(document);
  await createDuration({
    duration: vacationsDuration,
    document,
    height,
    period: vacationPeriod,
  });
  await createTitle({
    document,
    height,
    size: 19,
    title: `Requerimento de ${translateVacation(vacation.type)}`,
  });
  height.stepHugeLine();
  await createParagraph({
    document,
    font,
    fontSize: vacation.type === "license" ? 12 : 14,
    height,
    text: paragraph,
  });

  height.stepLines(3, "huge");

  const dateString = `Ilha solteira, ${new Date(
    vacation.updatedAt
  ).getDate()} de ${translateMonth(
    new Date(vacation.updatedAt).getMonth()
  )} de ${new Date(vacation.updatedAt).getFullYear()}`;
  await createParagraph({
    document,
    height,
    text: dateString,
    x: page.getWidth() - dateString.length * 7.5,
    ...(vacation.type === "dayOff" && {
      y: height.actual - 15,
    }),
    font,
    maxWidth: page.getWidth(),
  });

  height.stepLines(3, "huge");
  await createSign({
    document,
    height,
    matriculation: vacation.worker?.matriculation ?? "",
    name: capitalizeName(vacation.worker?.name),
    role: capitalizeFirstLetter(vacation.worker?.role) ?? "",
  });

  height.stepLines(3, "huge");
  const boss = vacation.boss ?? (await getBoss(vacation)) ?? "Chefe excluído";

  if (!boss)
    throw new Error(
      `Não há chefe cadastrado para a assinatura de ${translateVacation(
        vacation.type
      )}.`
    );

  const {
    name: bossName,
    role: bossRole,
    worker: bossWorker,
  } = vacation.boss ?? (await getBoss(vacation)) ?? "Chefe excluído";
  await createSign({
    document,
    height,
    name: bossName,
    role: bossRole,
    worker: bossWorker,
  });
};

const render = async ({ document, instance }: RenderParam): Promise<void> => {
  if (document && instance) {
    const page = document.addPage();
    const height = getHeightObject(page);
    const vacation = instance as Vacation;

    await drawHalfPage({
      document,
      height,
      vacation,
    });

    height.stepLines(4, "huge");

    await drawHalfPage({
      document,
      height,
      vacation,
    });
  }
};

export { render };
