import { capitalizeName } from "@/app/utils";
import type { VacationDTO, WorkerDTO } from "@/dto";

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
  vacation: VacationDTO;
}) => {
  const { worker, duration } = vacation;
  const dayQuantity = duration ?? 0;
  const daysQtdString = `${dayQuantity < 1 ? "½" : dayQuantity} dia${
    dayQuantity > 1 ? "s" : ""
  }`;
  const workerString = `${capitalizeName((worker as WorkerDTO).name)}(${
    (worker as WorkerDTO).matriculation
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
