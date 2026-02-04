import { format } from "date-fns";

import {
  numberToNumberString,
  translateVacation,
  translateVacationPeriod,
} from "../vacation/utils";
import type { VacationDTO } from "@/dto";

const cancellationParagraphBegin = (vacation: VacationDTO): string => `
\tAtravés deste, venho  solicitar o C A N C E L A M E N T O  da solicitação de ${translateVacation(
  vacation.type
)} de ${
  vacation.type === "dayOff"
    ? translateVacationPeriod(vacation.type as string)
    : `${vacation.duration} (${numberToNumberString(
        vacation.duration ?? 0
      )}) dia(s) de fruição`
}, `;

const cancellationParagraphEnd = (
  vacation: VacationDTO
): string => `com início no dia ${format(
  new Date(vacation.startDate),
  "dd/MM/yyyy"
)} e término no dia ${format(
  new Date(vacation.endDate),
  "dd/MM/yyyy"
)}.\n\nNesses termos, peço deferimento.
`;

const cancellationParagraph = (vacation: VacationDTO): string =>
  cancellationParagraphBegin(vacation).concat(
    cancellationParagraphEnd(vacation)
  );

export { cancellationParagraph };
