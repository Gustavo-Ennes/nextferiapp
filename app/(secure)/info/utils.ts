import type { FuelPriceVersionDTO } from "@/dto/FuelPriceVersionDTO";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import { partition } from "ramda";
import type {
  GetVacationDetailsParam,
  GetVacationDetailsReturn,
  GetWorkerByStatusReturn,
  SplitPurchaseOrderByValidFuelVersionParam,
  SplitPurchaseOrderByValidFuelVersionReturn,
  WeeklyFuellingSummariesTotals,
} from "./types";
import type { FuelDTO } from "@/dto/FuelDTO";
import type { DepartmentDTO, WeeklyFuellingSummaryDTO, WorkerDTO } from "@/dto";
import { capitalizeFirstLetter, getDaysUntilWorkerReturns } from "@/app/utils";
import { toMonetary } from "../materialRequisition/utils";
import { format, toDate } from "date-fns";

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
  const activeWorkers = workers.filter(
    (worker) => worker.isActive === true,
  ).length;
  const inactiveWorkers = workers.filter(
    (worker) => worker.isActive === false,
  ).length;
  const externalWorkers = workers.filter(
    (worker) => worker.isExternal == true,
  ).length;
  const internalWorkers = workers.filter(
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

export const getWeeklyFuellingSummaryLines = (
  summaries: WeeklyFuellingSummaryDTO[],
) => {
  const { totalWeeks, totalDepartments, totalVehicles, totalValue } =
    summaries.reduce<WeeklyFuellingSummariesTotals>(
      (acc, summary) => {
        return {
          totalWeeks: summaries.length,
          totalDepartments: acc.totalDepartments + summary.departments.length,
          totalVehicles:
            acc.totalVehicles +
            summary.departments.reduce(
              (accc, dept) => accc + dept.vehicles.length,
              0,
            ),
          totalValue:
            acc.totalValue +
            summary.departments.reduce(
              (accc, dept) => accc + dept.totalValue,
              0,
            ),
        };
      },
      {
        totalWeeks: 0,
        totalDepartments: 0,
        totalVehicles: 0,
        totalValue: 0,
      },
    );

  return [
    {
      primary: `${totalWeeks} ciclos ~ ${totalVehicles} veículos computados`,
      secondary: ``,
    },
    {
      primary: `${totalDepartments} departamentos lançados`,
      secondary: `${toMonetary(totalValue)} abastecidos`,
    },
  ];
};
