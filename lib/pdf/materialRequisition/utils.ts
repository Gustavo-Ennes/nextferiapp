import { CarEntry, FuelType } from "@/app/(secure)/materialRequisition/types";
import { LineData, TableData } from "../types";
import { format } from "date-fns";

export const parseMaterialRequisitionData = ({
  fuelings,
  fuel,
}: CarEntry): TableData => {
  const table = [];

  table.push(["DATA AB.", "QTD.", "UN.", "MATERIAL", "KM./HR.", "OBS."]);

  fuelings.forEach(({ quantity, date, kmHr }, fuelingIndex) => {
    const line: LineData = [];

    line.push(format(date, "dd/MM/yy"));
    line.push(quantity.toFixed(3));
    line.push(fuelingIndex === 0 ? "L" : undefined);
    line.push(fuelingIndex === 0 ? defineFuelString(fuel) : undefined);
    line.push(kmHr ? String(kmHr) : undefined);
    line.push(undefined);
    table.push(line);
  });

  // header plus ten lines
  while (table.length < 11)
    table.push([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ]);

  return table;
};

const defineFuelString = (fuel: FuelType): string | undefined => {
  switch (fuel) {
    case "gas":
      return "( X ) Gasol.";
    case "s10":
      return "( X ) S-10";
    case "s500":
      return "( X ) S-500";
    case "arla":
      return "( X ) Arla";
    default:
      return undefined;
  }
};
