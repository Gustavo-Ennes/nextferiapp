import type { CarEntry } from "@/lib/repository/weeklyFuellingSummary/types";
import type { LineData, TableData } from "../types";
import { format } from "date-fns";
import { translateFuelType } from "@/app/(secure)/purchaseOrder/utils";
import type { FuelDTO } from "@/dto/FuelDTO";

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
    line.push(
      fuelingIndex === 0 ? defineFuelString((fuel as FuelDTO).name) : undefined,
    );
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

const defineFuelString = (fuel: string): string | undefined => {
  return translateFuelType(fuel).toUpperCase();
};
