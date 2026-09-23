import type {
  FuelDTO,
  FuelingBatchDTO,
  DepartmentDTO,
  FuelingBatchDTODepartment,
  FuelingBatchDTOVehicle,
  FuelPriceVersionDTO,
} from "@/dto";
import type {
  FuelMixItem,
  GraphUtilFnParam,
  LitersTrendPoint,
  LitersTrendSeries,
  PieData,
  VehicleConsumptionRow,
  VehicleScatterSeries,
} from "./types";
import { format, isSameDay, toDate } from "date-fns";
import { flatten, isNil, pluck, reject, sum, uniq, dissoc } from "ramda";
import type {
  FuelingBatchFueling,
  FuelingBatchTotals,
  FuelingBatchPartials,
  TotalFuels,
} from "@/models/types";
import type { AverageDepartmentTableParam } from "./components/types";
import type {
  FuelingBatchDTOInvoice,
  FuelingBatchTableLine,
} from "@/dto/FuelingBatchDTO";
import type { ListPageRowFlags, RowFlag } from "../components/types";
import { ChatBubbleOutline } from "@mui/icons-material";

export const getFuelMix = ({
  fuelingBatches,
  selectedDepartment,
}: GraphUtilFnParam): FuelMixItem[] => {
  const map = new Map<string, number>();

  for (const batch of fuelingBatches) {
    for (const dep of filterDepartments(batch, selectedDepartment!)) {
      for (const vehicle of dep.vehicles) {
        const fuelName = (vehicle.fuel as FuelDTO).name;
        map.set(
          fuelName,
          (map.get(fuelName) ?? 0) + vehicle.totals.totalLiters,
        );
      }
    }
  }

  return Array.from(map.entries()).map(([label, value]) => ({
    id: label,
    label,
    value: parseFloat(value.toFixed(2)),
  }));
};

export const filterDepartments = (
  fuelingBatch: FuelingBatchDTO,
  selectedDepartment: string,
) => {
  if (selectedDepartment === "__ALL__") return fuelingBatch.departments;
  return fuelingBatch.departments.filter(
    (d) => (d.department as DepartmentDTO)._id === selectedDepartment,
  );
};

export function getVehicleScatterSeriesByDepartment(
  fuelingBatches: FuelingBatchDTO[],
): VehicleScatterSeries[] {
  const deptMap = new Map<
    string,
    Map<string, { liters: number; value: number; fuel: string }>
  >();

  for (const fuelingBatch of fuelingBatches) {
    for (const dep of fuelingBatch.departments) {
      const deptName = (dep.department as DepartmentDTO).name;

      if (!deptMap.has(deptName)) deptMap.set(deptName, new Map());
      const vehicleMap = deptMap.get(deptName)!;

      for (const vehicle of dep.vehicles) {
        const vehicleKey = `#${vehicle.prefix} - ${vehicle.vehicle}`;
        const existing = vehicleMap.get(vehicleKey) ?? {
          liters: 0,
          value: 0,
          fuel: (vehicle.fuel as FuelDTO).name,
        };
        existing.liters += vehicle.totals.totalLiters;
        existing.value += vehicle.totals.totalValue;
        vehicleMap.set(vehicleKey, existing);
      }
    }
  }

  return Array.from(deptMap.entries())
    .map(([deptName, vehicleMap]) => ({
      label: deptName,
      data: Array.from(vehicleMap.entries()).map(
        ([vehicleKey, { liters, value, fuel }]) => ({
          fuel,
          id: String(vehicleKey),
          x: parseFloat(liters.toFixed(2)),
          y: parseFloat(value.toFixed(2)),
        }),
      ),
    }))
    .filter((v) => v.data?.length > 0);
}

export const formatWeek = (weekStart: string): string => {
  const start = toDate(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${format(start, "dd/MM")} - ${format(end, "dd/MM/yy")}`;
};

export function getVehicleScatterSeriesByVehicle(
  fuelingBatches: FuelingBatchDTO[],
  selectedDepartment: string,
): VehicleScatterSeries[] {
  const sortedFuelingBatches = [...fuelingBatches].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return sortedFuelingBatches
    .map((fuelingBatch) => {
      const department = fuelingBatch.departments.find(
        (d) => (d.department as DepartmentDTO)._id === selectedDepartment,
      );
      const label = formatWeek(fuelingBatch.createdAt);
      if (!department) return { label, data: [] };

      return {
        label,
        data:
          department.vehicles?.map((vehicle) => ({
            fuel: (vehicle.fuel as FuelDTO).name,
            id: `#${vehicle.prefix} - ${vehicle.vehicle}`,
            x: parseFloat(vehicle.totals.totalLiters.toFixed(2)),
            y: parseFloat((vehicle.totals.totalKmHrs ?? 0).toFixed(2)),
          })) ?? [],
      };
    })
    .filter((v) => v.data?.length > 0) as VehicleScatterSeries[];
}

export const getVehicleCostVsLitersScatter = ({
  fuelingBatches,
  selectedDepartment,
}: GraphUtilFnParam): VehicleScatterSeries[] => {
  if (selectedDepartment === "__ALL__") {
    return getVehicleScatterSeriesByDepartment(fuelingBatches);
  }

  return getVehicleScatterSeriesByVehicle(fuelingBatches, selectedDepartment!);
};

export const getEfficiencyScatter = (
  fuelingBatches: FuelingBatchDTO[],
  selectedDepartment: string,
): VehicleScatterSeries[] => {
  if (selectedDepartment === "__ALL__") {
    return getEfficiencyScatterByDepartment(fuelingBatches);
  }
  return getEfficiencyScatterByVehicle(fuelingBatches, selectedDepartment);
};

const getEfficiencyScatterByDepartment = (
  fuelingBatches: FuelingBatchDTO[],
): VehicleScatterSeries[] => {
  // deptName -> { totalKmHr, totalLiters, totalValue, weeks }
  const deptMap = new Map<
    string,
    {
      totalKmHr: number;
      totalLiters: number;
      totalValue: number;
      weeks: number;
    }
  >();

  for (const fuelingBatch of fuelingBatches) {
    for (const dep of fuelingBatch.departments) {
      const deptName = (dep.department as DepartmentDTO).name;
      const existing = deptMap.get(deptName) ?? {
        totalKmHr: 0,
        totalLiters: 0,
        totalValue: 0,
        weeks: 0,
      };

      const kmHr = dep.vehicles.reduce(
        (a, v) => a + (v.totals.totalKmHrs ?? 0),
        0,
      );
      const liters = dep.vehicles.reduce((a, v) => a + v.totals.totalLiters, 0);

      existing.totalKmHr += kmHr;
      existing.totalLiters += liters;
      existing.totalValue += dep.totals.totalValue;
      existing.weeks += 1;

      deptMap.set(deptName, existing);
    }
  }

  return Array.from(deptMap.entries()).map(([deptName, agg]) => {
    const avgKmPerLiter =
      agg.totalLiters > 0 ? agg.totalKmHr / agg.totalLiters : 0;
    const avgCostPerKm = agg.totalKmHr > 0 ? agg.totalValue / agg.totalKmHr : 0;

    return {
      label: deptName,
      data: [
        {
          id: deptName,
          fuel: "",
          x: parseFloat(avgKmPerLiter.toFixed(2)),
          y: parseFloat(avgCostPerKm.toFixed(2)),
        },
      ],
    };
  });
};

const getEfficiencyScatterByVehicle = (
  fuelingBatches: FuelingBatchDTO[],
  selectedDepartment: string,
): VehicleScatterSeries[] => {
  const vehicleMap = new Map<
    string,
    {
      totalKmHr: number;
      totalLiters: number;
      totalValue: number;
      fuel: string;
      weeks: number;
    }
  >();

  for (const fuelingBatch of fuelingBatches) {
    const dep = fuelingBatch.departments.find(
      (d) => (d.department as DepartmentDTO)._id === selectedDepartment,
    );

    if (!dep) continue;

    for (const vehicle of dep.vehicles) {
      const key = `#${vehicle.prefix} - ${vehicle.vehicle}`;
      const existing = vehicleMap.get(key) ?? {
        totalKmHr: 0,
        totalLiters: 0,
        totalValue: 0,
        fuel: (vehicle.fuel as FuelDTO).name,
        weeks: 0,
      };

      existing.totalKmHr += vehicle.totals.totalKmHrs ?? 0;
      existing.totalLiters += vehicle.totals.totalLiters;
      existing.totalValue += vehicle.totals.totalValue;
      existing.weeks += 1;

      vehicleMap.set(key, existing);
    }
  }

  return Array.from(vehicleMap.entries()).map(([key, agg]) => {
    const avgKmPerLiter =
      agg.totalLiters > 0 ? agg.totalKmHr / agg.totalLiters : 0;
    const avgCostPerKm = agg.totalKmHr > 0 ? agg.totalValue / agg.totalKmHr : 0;

    return {
      label: key,
      data: [
        {
          id: key,
          fuel: agg.fuel,
          x: parseFloat(avgKmPerLiter.toFixed(2)),
          y: parseFloat(avgCostPerKm.toFixed(2)),
        },
      ],
    };
  });
};

export function getTopVehiclesByConsumption({
  fuelingBatches,
  selectedDepartment,
}: GraphUtilFnParam): VehicleConsumptionRow[] {
  const LIMIT = 10;
  const map = new Map<string, VehicleConsumptionRow>();

  for (const fuelingBatch of fuelingBatches) {
    for (const dep of filterDepartments(fuelingBatch, selectedDepartment!)) {
      for (const vehicle of dep.vehicles) {
        const vehicleKey = `#${vehicle.prefix} - ${vehicle.vehicle}`;
        const existing = map.get(vehicleKey) ?? {
          prefix: String(vehicle.prefix),
          totalLiters: 0,
          totalValue: 0,
        };
        existing.totalLiters += vehicle.totals.totalLiters;
        existing.totalValue += vehicle.totals.totalValue;
        map.set(vehicleKey, existing);
      }
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.totalLiters - a.totalLiters)
    .slice(0, LIMIT);
}

export const getLitersTrend = ({
  fuelingBatches,
  selectedDepartment,
}: GraphUtilFnParam): LitersTrendSeries[] => {
  if (selectedDepartment === "__ALL__") {
    return getLitersTrendByDepartment(fuelingBatches);
  }
  return getLitersTrendByFuel(fuelingBatches, selectedDepartment!);
};

const getLitersTrendByDepartment = (
  sorted: FuelingBatchDTO[],
): LitersTrendSeries[] => {
  const deptMap = new Map<string, LitersTrendPoint[]>();

  for (const fuelingBatch of sorted) {
    for (const dep of fuelingBatch.departments) {
      const deptName = (dep.department as DepartmentDTO).name;
      if (!deptMap.has(deptName)) deptMap.set(deptName, []);

      const totalLiters = dep.vehicles.reduce(
        (a, v) => a + v.totals.totalLiters,
        0,
      );
      deptMap.get(deptName)!.push({
        dateLabel: formatWeek(fuelingBatch.createdAt),
        date: fuelingBatch.createdAt,
        totalLiters: parseFloat(totalLiters.toFixed(2)),
      });
    }
  }

  return Array.from(deptMap.entries()).map(([label, data]) => ({
    label,
    data,
  }));
};

function getLitersTrendByFuel(
  sorted: FuelingBatchDTO[],
  selectedDepartment: string,
): LitersTrendSeries[] {
  const fuelMap = new Map<string, LitersTrendPoint[]>();

  for (const fuelingBatch of sorted) {
    const dep = fuelingBatch.departments.find(
      (d) => (d.department as DepartmentDTO)._id === selectedDepartment,
    );
    if (!dep) continue;

    for (const vehicle of dep.vehicles) {
      const fuelName = (vehicle.fuel as FuelDTO).name;
      if (!fuelMap.has(fuelName)) fuelMap.set(fuelName, []);

      const existing = fuelMap.get(fuelName)!;
      const weekEntry = existing.find((p) => p.date === fuelingBatch.createdAt);

      if (weekEntry) {
        weekEntry.totalLiters = parseFloat(
          (weekEntry.totalLiters + vehicle.totals.totalLiters).toFixed(2),
        );
      } else {
        existing.push({
          dateLabel: formatWeek(fuelingBatch.createdAt),
          date: fuelingBatch.createdAt,
          totalLiters: parseFloat(vehicle.totals.totalLiters.toFixed(2)),
        });
      }
    }
  }

  return Array.from(fuelMap.entries()).map(([label, data]) => ({
    label,
    data,
  }));
}

export const sumFuelingBatchPartials = ({
  total1,
  total2,
}: {
  total1: FuelingBatchPartials;
  total2: FuelingBatchPartials;
}): FuelingBatchPartials => ({
  totalLiters: total1.totalLiters + total2.totalLiters,
  totalKmHrs:
    total1.totalKmHrs && total2.totalKmHrs
      ? total1.totalKmHrs + total2.totalKmHrs
      : 0,
  totalValue: total1.totalValue + total2.totalValue,
});

export const sumFuelingBatchTotals = ({
  total1,
  total2,
}: {
  total1: FuelingBatchTotals;
  total2: FuelingBatchTotals;
}): FuelingBatchTotals => {
  const fuelMap = new Map<string, { liters: number; value: number }>();
  for (const total of [total1, total2]) {
    for (const [fuelName, { liters, value }] of Object.entries(
      total.totalFuels,
    )) {
      const existing = fuelMap.get(fuelName) ?? { liters: 0, value: 0 };
      existing.liters += liters;
      existing.value += value;
      fuelMap.set(fuelName, existing);
    }
  }
  return {
    totalValue: total1.totalValue + total2.totalValue,
    totalFuels: Object.fromEntries(fuelMap.entries()),
    totalKmHrs: total1.totalKmHrs + total2.totalKmHrs,
    totalFuelings: total1.totalFuelings + total2.totalFuelings,
    totalVehicles: total1.totalVehicles + total2.totalVehicles,
  };
};

export const getFuelTotalsFromDepartmentInfos = (
  departments: FuelingBatchDTODepartment[],
): Record<string, number> => {
  if (!departments || departments.length === 0) return {};
  const values: Record<string, number> = {};

  for (const dept of departments) {
    for (const [fuelName, { value }] of Object.entries(
      dept.totals.totalFuels,
    )) {
      if (!values[fuelName]) values[fuelName] = 0;
      values[fuelName] += value;
    }
  }

  return values;
};

export const getPieData = ({
  fuelingBatches,
  selectedDepartment,
}: GraphUtilFnParam): PieData[] => {
  const departmentsInfo = flatten(fuelingBatches.map((s) => s.departments));
  const uniqueDepartmentsInfo: FuelingBatchDTODepartment[] = [];

  if (selectedDepartment === "__ALL__") {
    departmentsInfo.forEach((deptInfo) => {
      const existing = uniqueDepartmentsInfo.find(
        (d) =>
          (d.department as DepartmentDTO)._id ===
          (deptInfo.department as DepartmentDTO)._id,
      );

      if (!existing) {
        uniqueDepartmentsInfo.push(deptInfo);
      } else {
        const sum = sumFuelingBatchTotals({
          total1: existing.totals,
          total2: deptInfo.totals,
        });
        existing.totals = sum;
      }
    });
    return uniqueDepartmentsInfo.map((d) => ({
      id: (d.department as DepartmentDTO)._id,
      label: (d.department as DepartmentDTO).name,
      value: d.totals.totalValue,
    }));
  }

  const filteredDepartments = departmentsInfo.filter(
    (d) => (d.department as DepartmentDTO)._id === selectedDepartment,
  );

  const fuelTotals = getFuelTotalsFromDepartmentInfos(filteredDepartments);

  return Object.entries(fuelTotals).map(([fuelName, totalLiters]) => ({
    id: fuelName,
    label: fuelName.toUpperCase(),
    value: totalLiters,
  }));
};

export const getDepartmentDateRows = (
  fuelingBatches: FuelingBatchDTO[],
  department: DepartmentDTO,
): AverageDepartmentTableParam[] => {
  return (
    fuelingBatches
      .map(({ createdAt, departments }) => {
        const isAllDepartments = department._id === "__ALL__";
        const dept = !isAllDepartments
          ? departments.find((d) => d.name === department.name)
          : null;
        const filteredDepartments = isAllDepartments
          ? departments
          : dept
            ? [dept]
            : [];

        return {
          createdAt,
          ...(filteredDepartments.length > 0
            ? getFuelTotalsFromDepartmentInfos(filteredDepartments)
            : {}),
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime(),
      ) ?? []
  );
};

export const getFuelsUsedInBatches = (
  fuelingBatches: FuelingBatchDTO[],
): FuelDTO[] => {
  const fuels: FuelDTO[] = [];

  fuelingBatches.forEach((fuelingBatch) => {
    fuelingBatch.departments.forEach((dept) => {
      dept.vehicles.forEach((vehicle) => {
        const fuelInBatch = fuels.find(
          (f) => f._id === (vehicle.fuel as FuelDTO)._id,
        );
        if (!fuelInBatch && typeof vehicle.fuel === "object") {
          fuels.push(vehicle.fuel as FuelDTO);
        }
      });
    });
  });

  return fuels;
};

export const ALL = "__ALL__";

const monetaryFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
export const toMonetary = (n: number): string => monetaryFormatter.format(n);

export const countAllCars = (fuelingBatch: FuelingBatchDTO): number =>
  fuelingBatch.departments.reduce(
    (total, dept) => total + (dept.vehicles?.length || 0),
    0,
  );

export const countAllFuelings = (fuelingBatch: FuelingBatchDTO): number =>
  sum(
    fuelingBatch.departments.flatMap(
      (dept) => dept.vehicles?.flatMap((v) => v.fuelings?.length || 0) || [],
    ),
  );

export const countAllLiters = (fuelingBatch: FuelingBatchDTO): number =>
  sum(
    fuelingBatch.departments.flatMap(
      (dept) =>
        dept.vehicles?.flatMap(
          (v) => v.fuelings?.map((f) => f.quantity) || [],
        ) || [],
    ),
  );

export const getCarTotalKmHr = (
  fuelings: FuelingBatchFueling[],
): number | null => {
  const kmHrs = pluck("kmHr", fuelings);
  const kmHrsWithoutNull = reject(isNil, kmHrs);
  const minkmHr = Math.min(...(kmHrsWithoutNull ?? []));
  const maxkmHr = Math.max(...(kmHrsWithoutNull ?? []));
  return minkmHr && maxkmHr && maxkmHr > minkmHr ? maxkmHr - minkmHr : null;
};

export const countAllKms = (fuelingBatch: FuelingBatchDTO): number => {
  let sum = 0;
  fuelingBatch.departments.forEach((dept) =>
    dept.vehicles?.forEach((vehicle) => {
      sum += getCarTotalKmHr(vehicle.fuelings ?? []) ?? 0;
    }),
  );
  return sum;
};

export const countAllInvoices = (fuelingBatch: FuelingBatchDTO): number => {
  return sum(fuelingBatch.departments.map((d) => d.invoices?.length ?? 0));
};

export const countAllInvoicesValues = (
  fuelingBatch: FuelingBatchDTO,
): string => {
  const _sum = sum(
    fuelingBatch.departments.map((d) => sum(d.invoices.map((i) => i.total))),
  );
  return toMonetary(_sum);
};

export const departmentHasPrefix = ({
  department,
  prefix,
}: {
  department: FuelingBatchDTODepartment;
  prefix: number;
}): boolean => {
  const prefixes = pluck("prefix", department.vehicles ?? []);
  return prefixes.includes(prefix);
};

export const getVehicleFuel = (
  vehicle: FuelingBatchDTOVehicle,
  fuels: FuelDTO[],
): FuelPriceVersionDTO | null => {
  const fuel = fuels.find((f) => {
    return f._id === (vehicle.fuel as FuelDTO)._id;
  });

  return fuel ? (fuel.currentPriceVersion as FuelPriceVersionDTO) : null;
};

export const prepareFuelingBatchPayload = (
  fuelingBatch: Partial<FuelingBatchDTO>,
): Partial<FuelingBatchDTO> => {
  const preparedPayload = {
    ...fuelingBatch,
    departments: fuelingBatch.departments?.map((d) => ({
      ...d,
      department: (d.department as DepartmentDTO)?._id ?? d.department,
      vehicles: d.vehicles?.map((v) => ({
        ...v,
        fuel: (v.fuel as FuelDTO)?._id ?? v.fuel,
        lastKm: null,
      })),
    })),
  };

  return preparedPayload._id ? preparedPayload : dissoc("_id", preparedPayload);
};

export const sortVehicleFuelings = (
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

export const resolveName = (entity: unknown, fallback = "—"): string => {
  if (entity && typeof entity === "object" && "name" in entity) {
    return String((entity as { name: unknown }).name ?? fallback);
  }
  return fallback;
};

export const getInvoicesTotalFuels = (
  invoices: FuelingBatchDTOInvoice[],
  fuels: FuelDTO[],
): TotalFuels => {
  const totals: TotalFuels = {};
  invoices.forEach((invoice) => {
    invoice.items.forEach((item) => {
      const fuel = fuels.find((f) => f._id === item.fuel);
      const fuelName = fuel?.name ?? "";
      if (!totals[fuelName]) {
        totals[fuelName] = { liters: 0, value: 0 };
      }
      totals[fuelName].liters += item.quantity;
      totals[fuelName].value += item.total;
    });
  });
  return totals;
};

export const checkInvoiceFuelQuantity = ({
  totalFuels,
  fuelName,
  quantity,
}: {
  totalFuels: TotalFuels;
  fuelName: string;
  quantity: number;
}): boolean => totalFuels[fuelName]?.liters >= quantity;

export const getEmptyFuelingBatch = (): FuelingBatchDTO => ({
  _id: "",
  createdAt: new Date().toISOString(),
  observation: "",
  totals: {
    totalValue: 0,
    totalFuels: {},
    totalKmHrs: 0,
    totalFuelings: 0,
    totalVehicles: 0,
  },
  departments: [],
});

export const hasFuelings = (fuelingBatch: FuelingBatchDTO): boolean => {
  return fuelingBatch.departments.some((department) =>
    department.vehicles.some((vehicle) => (vehicle.fuelings ?? [])?.length > 0),
  );
};

export const getInvoicesFuels = ({
  fuelingBatchDepartment,
  fuels,
}: {
  fuelingBatchDepartment: FuelingBatchDTODepartment;
  fuels: FuelDTO[];
}): FuelDTO[] => {
  const invoicesFuelsIds = uniq(
    (flatten(
      fuelingBatchDepartment.invoices.map((i) => i.items.map((ii) => ii.fuel)),
    ) ?? []) as string[],
  );

  const invoiceFuels = fuels.filter((f) => invoicesFuelsIds.includes(f._id));

  return invoiceFuels;
};

export const invoiceExists = ({
  invoiceNumber,
  invoices,
}: {
  invoiceNumber: string;
  invoices: FuelingBatchDTOInvoice[];
}): boolean => invoices.map((i) => i.number).includes(Number(invoiceNumber));

export const fuelingValuesMatchInvoiceValues = (
  fuelInventory: TotalFuels,
): boolean => {
  return (
    fuelInventory &&
    Object.keys(fuelInventory).every(
      (key) =>
        fuelInventory[key].value > -0.5 && fuelInventory[key].value < 0.5,
    )
  );
};

export const getFuelingBatchRowFlags = (
  fuelingBatches: FuelingBatchTableLine[],
): ListPageRowFlags => {
  const map = new Map<string, RowFlag[]>();
  fuelingBatches.forEach((fuelingBatch) => {
    if (fuelingBatch.observation)
      map.set(fuelingBatch._id, [
        {
          message: `Observação: ${fuelingBatch.observation}`,
          icon: <ChatBubbleOutline color="primary" />,
        },
      ]);
  });

  return map;
};
