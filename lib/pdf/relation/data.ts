import { Vacation, Worker } from "@/app/types";
import { capitalizeName } from "@/app/utils";

const getNoInstancesText = (instanceTranslatedPluralName: string) =>
  `Não há ${instanceTranslatedPluralName}.`;

const getRelationTitle = ({
  period,
  translatedType,
}: {
  translatedType: string;
  period: string;
}) => `Relação de ${translatedType}${period ? ": " + period : ""}`;

const getRelationItemText = ({
  formatedDate,
  index,
  vacation,
}: {
  index: number;
  formatedDate: string;
  vacation: Vacation;
}) => {
  const { daysQtd, worker, duration } = vacation;
  const dayQuantity = duration ?? daysQtd ?? 0;
  const daysQtdString = `${dayQuantity < 1 ? "½" : daysQtd} dia${
    dayQuantity > 1 ? "s" : ""
  }`;
  const workerString = `${capitalizeName((worker as Worker).name)}(${
    (worker as Worker).matriculation
  })`;
  return `${index + 1} - ${formatedDate} - ${daysQtdString} - ${workerString}`;
};

const getTranslatedPeriod = (period: string) => {
  switch (period) {
    case "past":
      return "passado";
    case "present":
      return "presente";
    case "future":
      return "futuros";
    default:
      return "";
  }
};

export {
  getNoInstancesText,
  getRelationItemText,
  getRelationTitle,
  getTranslatedPeriod,
};
