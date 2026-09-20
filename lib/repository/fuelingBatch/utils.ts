import { getCarTotalKmHr } from "@/app/(secure)/fuelingBatch/utils";
import type { FuelingBatchDTO, FuelDTO, FuelPriceVersionDTO } from "@/dto";
import type {
  FuelingBatchFueling,
  FuelingBatchPartials,
  FuelingBatchTotals,
} from "@/models/types";
import { isSameDay, toDate } from "date-fns";
import { clone } from "ramda";
import type { AreDepartmentsOkParams, AreFuelsOkParams } from "./types";
import type { TotalFuels } from "@/models/types";

export const sortCarFuelings = (
  fuelings: FuelingBatchFueling[],
): FuelingBatchFueling[] =>
  [...fuelings].sort((a, b) =>
    // in case fuelings in the same day
    isSameDay(toDate(a.date), toDate(b.date))
      ? // we consider the kmHr
        (a.kmHr ?? 0) - (b.kmHr ?? 0)
      : // or just the date
        toDate(a.date).getTime() - toDate(b.date).getTime(),
  );

export const calculateFuelingBatchTotals = ({
  payload,
  fuels,
}: {
  payload: Partial<FuelingBatchDTO>;
  fuels: FuelDTO[];
}): Partial<FuelingBatchDTO> => {
  const toUpdateSummary = clone(payload);
  const payloadDepartments = toUpdateSummary.departments ?? [];

  for (let d = 0; d < payloadDepartments.length; d++) {
    const department = payloadDepartments[d];
    let departmentTotals: FuelingBatchTotals = {
      totalValue: 0,
      totalFuels: {},
      totalKmHrs: 0,
      totalFuelings: 0,
      totalVehicles: 0,
    };

    for (let v = 0; v < department.vehicles.length; v++) {
      let vehicleTotals: FuelingBatchPartials = {
        totalValue: 0,
        totalLiters: 0,
        totalKmHrs: 0,
      };
      const vehicle = department.vehicles[v];
      const vehicleFuelings = vehicle.fuelings ?? [];
      const fuel = fuels.find((f) => {
        return (
          f._id === (vehicle.fuel as FuelDTO)._id ||
          f._id === (vehicle.fuel as string)
        );
      });

      if (!fuel)
        throw new Error(`Fuel not found for vehicle ${vehicle.vehicle}`);

      for (let f = 0; f < vehicleFuelings.length; f++) {
        const fueling = vehicleFuelings[f];

        vehicleTotals.totalValue +=
          fueling.quantity *
          (fuel.currentPriceVersion as FuelPriceVersionDTO).price;
        vehicleTotals.totalLiters += fueling.quantity;
      }
      vehicleTotals.totalKmHrs = getCarTotalKmHr(vehicleFuelings) ?? 0;

      // assign the calculated totals to the vehicle in the department
      toUpdateSummary.departments![d].vehicles[v].totals = vehicleTotals;

      departmentTotals.totalValue += vehicleTotals.totalValue;
      departmentTotals.totalKmHrs += vehicleTotals.totalKmHrs ?? 0;
      departmentTotals.totalFuelings += vehicleFuelings.length;
      departmentTotals.totalVehicles += 1;

      departmentTotals.totalFuels[fuel.name] = {
        liters:
          (departmentTotals.totalFuels[fuel.name]?.liters ?? 0) +
          vehicleTotals.totalLiters,
        value:
          (departmentTotals.totalFuels[fuel.name]?.value ?? 0) +
          vehicleTotals.totalValue,
      };
    }
    // asign the calculated totals to the department in the summary
    toUpdateSummary.departments![d].totals = departmentTotals;
  }

  const summaryTotals = toUpdateSummary.departments!.reduce(
    (acc, department) => {
      acc.totalValue += department.totals.totalValue;
      acc.totalKmHrs += department.totals.totalKmHrs;
      acc.totalFuelings += department.totals.totalFuelings;
      acc.totalVehicles += department.totals.totalVehicles;

      for (const fuelName in department.totals.totalFuels) {
        if (!acc.totalFuels[fuelName]) {
          acc.totalFuels[fuelName] = { liters: 0, value: 0 };
        }
        acc.totalFuels[fuelName].liters +=
          department.totals.totalFuels[fuelName].liters;
        acc.totalFuels[fuelName].value +=
          department.totals.totalFuels[fuelName].value;
      }

      return acc;
    },
    {
      totalValue: 0,
      totalFuels: {},
      totalKmHrs: 0,
      totalFuelings: 0,
      totalVehicles: 0,
    } as FuelingBatchTotals,
  );

  toUpdateSummary.totals = summaryTotals;

  return toUpdateSummary;
};

export const areFuelsOk = async ({
  payload,
  fuels,
}: AreFuelsOkParams): Promise<boolean> => {
  const fuelsIds = fuels.map((f) => f._id);

  const payloadFuelsIds = payload.departments?.flatMap((d) =>
    d.vehicles.flatMap((v) => v.fuel as string),
  );
  const areOk =
    payloadFuelsIds?.every((f) => fuelsIds.includes(f)) ||
    payloadFuelsIds?.length === 0;

  return areOk;
};

export const areDepartmentsOK = async ({
  payload,
  DepartmentRepository,
}: AreDepartmentsOkParams): Promise<boolean> => {
  const departmentsIds = (
    await DepartmentRepository.findWithoutPagination!({})
  ).map((d) => d._id.toString());
  const payloadDepartmentsIds =
    payload.departments?.map((d) => d.department as string) ?? [];

  const areOk =
    payloadDepartmentsIds.every((d) => departmentsIds.includes(d)) ||
    payloadDepartmentsIds.length === 0;

  return areOk;
};

export const getFuelMessageByLiters = ({
  liters,
  fuelName,
}: {
  liters: number;
  fuelName: string;
}): string =>
  `${liters < 0 ? liters * -1 : liters}L de ${fuelName} ${liters > 0 ? "sobrando" : "faltando"}`;

// positive values represent more fuel in invoices than in existing fuelings. Can add more fuelings or not
// negative values represent more fuel in existing fueling than in invoices. Must add invoices to those fuels
export const getFuelInventory = ({
  departmentTotalFuels,
  invoiceTotalFuels,
}: {
  departmentTotalFuels: TotalFuels;
  invoiceTotalFuels: TotalFuels;
}): {
  totals: TotalFuels;
  messages?: {
    [key: string]: string;
  };
} => {
  const departmentKeys = Object.keys(departmentTotalFuels);
  const invoiceKeys = Object.keys(invoiceTotalFuels);
  const totals: TotalFuels = {};
  const messages: { [key: string]: string } = {};

  for (let i = 0; i < departmentKeys.length; i++) {
    const fuelName = departmentKeys[i];
    const departmentEntry = departmentTotalFuels[fuelName];
    const invoiceEntry = invoiceTotalFuels[fuelName] ?? null;

    totals[fuelName] = {
      liters: invoiceEntry
        ? invoiceEntry.liters - departmentEntry.liters
        : departmentEntry.liters * -1,
      value: invoiceEntry
        ? invoiceEntry.value - departmentEntry.value
        : departmentEntry.value * -1,
    };
    messages[fuelName] = getFuelMessageByLiters({
      liters: totals[fuelName].liters,
      fuelName,
    });
  }

  for (let i = 0; i < invoiceKeys.length; i++) {
    if (!totals[invoiceKeys[i]]) {
      totals[invoiceKeys[i]] = invoiceTotalFuels[invoiceKeys[i]];
      messages[invoiceKeys[i]] = getFuelMessageByLiters({
        liters: totals[invoiceKeys[i]].liters,
        fuelName: invoiceKeys[i],
      });
    }
  }

  return { totals, messages };
};
