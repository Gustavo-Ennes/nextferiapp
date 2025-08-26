import type { Vacation } from "@/app/types";

import { dayOffParagraph, licenseParagraph, vacationParagraph } from "./text";
import { VacationType } from "@/app/(secure)/vacation/types";

const numberToNumberString = (number: number): string => {
  if (number === 15) return "quinze";
  if (number === 30) return "trinta";
  if (number === 45) return "quarenta e cinco";
  if (number === 60) return "sessenta";
  if (number === 75) return "setenta e cinco";
  if (number === 90) return "noventa";
  return "";
};

const translateVacation = (vacationType: VacationType): string => {
  if (vacationType === "normal") return "férias";
  if (vacationType === "license") return "licença-prêmio";
  if (vacationType === "dayOff") return "abono";
  return "";
};

const translateMonth = (month: number): string => {
  if (month === 0) return "janeiro";
  if (month === 1) return "fevereiro";
  if (month === 2) return "março";
  if (month === 3) return "abril";
  if (month === 4) return "maio";
  if (month === 5) return "junho";
  if (month === 6) return "julho";
  if (month === 7) return "agosto";
  if (month === 8) return "setembro";
  if (month === 9) return "outubro";
  if (month === 10) return "novembro";
  if (month === 11) return "dezembro";
  return "";
};

const translateVacationPeriod = (period: string): string => {
  if (period === "full") return "integral";
  if (period === "half") return "meio expediente";
  return "";
};

const getParagraph = (vacation: Vacation): string => {
  if (vacation.type === "normal") return vacationParagraph(vacation);
  else if (vacation.type === "license") return licenseParagraph(vacation);
  else if (vacation.type === "dayOff") return dayOffParagraph(vacation);
  else throw new Error("getParagraph: invalid type parameter");
};
export {
  getParagraph,
  numberToNumberString,
  translateMonth,
  translateVacation,
  translateVacationPeriod,
};
