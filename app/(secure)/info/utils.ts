import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import { clone, partition, pluck } from "ramda";
import type {
  GetVacationDetailsParam,
  GetVacationDetailsReturn,
  GetWorkerByStatusReturn,
  SplitPurchaseOrderByValidFuelVersionParam,
  SplitPurchaseOrderByValidFuelVersionReturn,
} from "./types";
import type { FuelDTO } from "@/dto/FuelDTO";
import type {
  DepartmentDTO,
  FuelingBatchDTO,
  FuelingBatchDTODepartment,
  FuelingBatchDTOVehicle,
  WorkerDTO,
} from "@/dto";
import { capitalizeFirstLetter, getDaysUntilWorkerReturns } from "@/app/utils";
import { toMonetary } from "../fuelingBatch/utils";
import { format, toDate } from "date-fns";
import {
  sumFuelingBatchPartials,
  sumFuelingBatchTotals,
} from "../fuelingBatch/utils";
import { Types } from "mongoose";

export const splitPurchaseOrderByValidFuelVersion = ({
  purchaseOrders,
  fuels,
}: SplitPurchaseOrderByValidFuelVersionParam): SplitPurchaseOrderByValidFuelVersionReturn => {
  const fuelsXCurrentPriceVersion = new Map<string, number>();

  fuels.forEach((fuel) =>
    fuelsXCurrentPriceVersion.set(
      fuel._id,
      (fuel.currentPriceVersion as FuelPriceVersionDTO).version,
    ),
  );

  const partialInvalidFilter = (p: PurchaseOrderDTO): boolean =>
    p.items.some((i) => {
      const fuelId = (i.fuel as FuelDTO)._id;
      const fuelPriceVersionNumber = (i.fuelPriceVersion as FuelPriceVersionDTO)
        .version;

      return (
        fuelsXCurrentPriceVersion.has(fuelId) &&
        fuelsXCurrentPriceVersion.get(fuelId) !== fuelPriceVersionNumber
      );
    });

  const invalidFilter = (p: PurchaseOrderDTO): boolean =>
    p.items.every((i) => {
      const fuelId = (i.fuel as FuelDTO)._id;
      const fuelPriceVersionNumber = (i.fuelPriceVersion as FuelPriceVersionDTO)
        .version;

      return (
        fuelsXCurrentPriceVersion.has(fuelId) &&
        fuelsXCurrentPriceVersion.get(fuelId) !== fuelPriceVersionNumber
      );
    });
  const [partialInvalid, valid] = partition(
    partialInvalidFilter,
    purchaseOrders,
  );
  const [invalid, _] = partition(invalidFilter, purchaseOrders);

  const partialInvalidWithoutTotallyInvalid = partialInvalid.reduce(
    (acc: PurchaseOrderDTO[], order: PurchaseOrderDTO) => {
      const invalidIds = invalid.map((i) => i._id);

      return !invalidIds.includes(order._id) ? [...acc, order] : acc;
    },
    [],
  );

  return {
    partialInvalid: partialInvalidWithoutTotallyInvalid,
    invalid,
    valid,
  };
};

export const getWorkersByStatus = (
  workers: WorkerDTO[],
): GetWorkerByStatusReturn => {
  const [active, inactive] = partition(
    (worker) => worker.isActive === true,
    workers,
  );

  const activeWorkers = active.length;
  const inactiveWorkers = inactive.length;
  const externalWorkers = active.filter(
    (worker) => worker.isExternal == true,
  ).length;
  const internalWorkers = active.filter(
    (worker) => worker.isExternal === false,
  ).length;

  return { activeWorkers, inactiveWorkers, externalWorkers, internalWorkers };
};

export const getVacationDetails = ({
  onVacationToday,
  vacations,
  returningToday,
  upcomingLeaves,
  upcomingReturns,
}: GetVacationDetailsParam): GetVacationDetailsReturn => {
  const onVacationDetails = onVacationToday
    ? onVacationToday.map((worker) =>
        worker
          ? `${worker?.name} - retorna em ${getDaysUntilWorkerReturns(
              worker,
              vacations,
            )} dias\n`
          : "",
      )
    : ["Ninguém folgando hoje."];

  const returningDetails = returningToday.length
    ? returningToday.map(({ worker }) => (worker as WorkerDTO)?.name)
    : ["Ninguém retornando hoje."];

  const upcomingLeavesLines = upcomingLeaves?.map(({ worker, startDate }) => ({
    primary: (worker as WorkerDTO)?.name,
    secondary: `Saindo dia ${format(startDate, "dd/MM/yyyy")}`,
  }));

  const upcomingReturnsLines = upcomingReturns?.map(
    ({ worker, returnDate }) => ({
      primary: (worker as WorkerDTO)?.name,
      secondary: `Retornando dia ${format(
        toDate(returnDate ?? ""),
        "dd/MM/yyyy",
      )}`,
    }),
  );

  return {
    onVacationDetails,
    returningDetails,
    upcomingLeavesLines,
    upcomingReturnsLines,
  };
};

export const getWorkerDetails = (workers: WorkerDTO[]) => {
  const { inactiveWorkers, internalWorkers, externalWorkers } =
    getWorkersByStatus(workers);

  return [
    `${inactiveWorkers} servidores inativos ou desligados.`,
    `${internalWorkers} servidores internos.`,
    `${externalWorkers} servidores externos.`,
  ];
};

export const getDepartmentDetails = (departments: DepartmentDTO[]) => {
  const [hasWorkerDepartments, hasNotWorkerDepartments] = partition(
    (d) => !!d.hasWorkers,
    departments,
  );
  return [
    `${hasWorkerDepartments.length} departamentos com servidores internos`,
    `${hasNotWorkerDepartments.length} departamentos externos`,
  ];
};

export const getPurchaseOrderLines = ({
  valid,
  partialInvalid,
  invalid,
}: SplitPurchaseOrderByValidFuelVersionReturn) => [
  {
    primary: String(valid.length),
    secondary: "pedidos válidos",
  },
  {
    primary: String(partialInvalid.length),
    secondary:
      "pedidos parciamente válidos(1 ou mais combustíveis com versão de preço desatualizada)",
  },
  {
    primary: String(invalid.length),
    secondary:
      "pedidos totalmente inválidos(todas as versões de preço desatualizadas)",
  },
];

export const getFuelLines = (fuels: FuelDTO[]) =>
  fuels.map((f) => {
    const priceVersion = f.currentPriceVersion as FuelPriceVersionDTO;
    return {
      primary: `${capitalizeFirstLetter(f.name.toLowerCase())}`,
      secondary: `${toMonetary(priceVersion.price)}/${f.unit} - v${priceVersion.version}`,
    };
  });

export const sumFuelingBatches = ({
  fuelingBatches,
}: {
  fuelingBatches: FuelingBatchDTO[];
}): FuelingBatchDTO => {
  const sumFuelingBatch: FuelingBatchDTO = {
    _id: new Types.ObjectId().toString(),
    createdAt: new Date().toISOString(),
    departments: [],
    totals: {
      totalFuelings: 0,
      totalFuels: {},
      totalKmHrs: 0,
      totalValue: 0,
      totalVehicles: 0,
    },
  };

  for (let i = 0; i < fuelingBatches.length; i++) {
    const fuelingBatch = fuelingBatches[i];

    for (let j = 0; j < fuelingBatch.departments.length; j++) {
      const department = fuelingBatch.departments[j];

      if (
        pluck("name", sumFuelingBatch.departments).includes(department.name)
      ) {
        const sumDepartment = sumFuelingBatch.departments.find(
          (d) => d.name === department.name,
        ) as FuelingBatchDTODepartment;

        sumDepartment.totals = sumFuelingBatchTotals({
          total1: sumDepartment!.totals,
          total2: department.totals,
        });

        for (let k = 0; k < department.vehicles.length; k++) {
          const vehicle = department.vehicles[k];

          if (
            pluck("prefix", sumDepartment.vehicles).includes(vehicle.prefix)
          ) {
            const sumVehicle = sumDepartment.vehicles.find(
              (v) => v.prefix === vehicle.prefix,
            ) as FuelingBatchDTOVehicle;

            sumVehicle.totals = sumFuelingBatchPartials({
              total1: sumVehicle.totals,
              total2: vehicle.totals,
            });

            for (let l = 0; l < (vehicle.fuelings ?? []).length; l++) {
              const fueling = vehicle.fuelings![l];
              const shouldSumFueling = sumVehicle.fuelings?.every(
                (f) =>
                  f.date !== fueling.date &&
                  f.kmHr !== fueling.kmHr &&
                  f.quantity !== fueling.quantity,
              );
              if (shouldSumFueling) sumVehicle.fuelings?.push(clone(fueling));
            }
          } else {
            sumDepartment.vehicles.push(clone(vehicle));
            continue;
          }
        }
      } else {
        sumFuelingBatch.departments.push(clone(department));
        continue;
      }
    }
  }
  return sumFuelingBatch;
};

export const getFuelingBatchLines = (fuelingBatches: FuelingBatchDTO[]) => {
  const {
    totals: { totalVehicles, totalValue },
    departments,
  } = sumFuelingBatches({ fuelingBatches });

  return [
    {
      primary: `${fuelingBatches.length} ciclos ~ ${totalVehicles} veículos computados`,
      secondary: ``,
    },
    {
      primary: `${departments.length} departamentos lançados`,
      secondary: `${toMonetary(totalValue)} abastecidos`,
    },
  ];
};
