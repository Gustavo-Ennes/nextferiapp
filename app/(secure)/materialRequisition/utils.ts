import { format, isSameDay, toDate, addDays } from "date-fns";
import type { LocalStorageData } from "../../../lib/repository/weeklyFuellingSummary/types";
import { flatten, isNil, pluck, reject, sum } from "ramda";
import type { AverageDepartmentTableParam } from "./components/types";
import type {
  DepartmentDTO,
  WeeklyFuellingSummaryDTO,
  FuelDTO,
  WeeklyFuellingSummaryDepartment,
  WeeklyFuellingSummaryVehicle,
  FuelPriceVersionDTO,
} from "@/dto";
import type {
  DepartmentConsumptionRow,
  DepartmentScatterSeries,
  FuelMixItem,
  LitersTrendPoint,
  LitersTrendSeries,
  VehicleConsumptionRow,
  VehicleScatterSeries,
  PieData,
  GraphUtilFnParam,
} from "./types";
import type { FuelingData } from "@/models/types";
// import { mockedTabsData } from "./mock";

export const setLocalStorageData = ({
  data,
  dispatch,
}: {
  data: LocalStorageData;
  dispatch?: boolean;
}) => {
  localStorage.setItem("pfdDataUpdate", JSON.stringify(data));
  if (dispatch) dispatchEvent(new Event("pfdDataUpdate"));
};

export const getLocalStorageData = async (): Promise<LocalStorageData> => {
  const rawData = localStorage.getItem("pfdDataUpdate") as string;
  const emptyData: LocalStorageData = {
    pdfData: { items: [], opened: false },
  };
  const data: LocalStorageData = rawData
    ? await JSON.parse(rawData)
    : emptyData;
  return data;
};

// USE TO GENERATE RANDOM DATA(config in mock.ts)
// (ERASE LOCALHOST TO GENERATE NEW MOCKED DATA)
// const mockedData = mockedTabsData();
// const localData = rawData
//   ? await JSON.parse(rawData)
//   : {
//       data: mockedData,
//       activeTab: Math.floor(Math.random() * mockedData.length),
//       pdfData: {
//         items: [{ data: mockedData, type: "materialRequisition" }],
//         opened: false,
//       },
//     };

// return localData;

export const a11yProps = (index: number) => ({
  id: `tabPanel-${index}`,
  "aria-controls": `tabPanel-${index}`,
});

export const getLabel = ({ quantity, date }: FuelingData): string =>
  `${format(new Date(date), "dd/MM/yy")} - ${quantity.toFixed(3)}L.`;

export const removeAllVechiles = (
  department: WeeklyFuellingSummaryDepartment,
): WeeklyFuellingSummaryDepartment => ({ ...department, vehicles: [] });

export const sortCarFuelings = (fuelings: FuelingData[]): FuelingData[] =>
  [...fuelings].sort((a, b) =>
    // in case fuelings in the same day
    isSameDay(toDate(a.date), toDate(b.date))
      ? // we consider the kmHr
        (a.kmHr ?? 0) - (b.kmHr ?? 0)
      : // or just the date
        toDate(a.date).getTime() - toDate(b.date).getTime(),
  );

export const prefixExistsInSummaryDepartment = ({
  prefix,
  summaryDepartment: { vehicles },
}: {
  summaryDepartment: WeeklyFuellingSummaryDepartment;
  prefix: number;
}) => {
  const prefixes = pluck("prefix", vehicles ?? []);

  return prefixes.includes(prefix);
};

export const resumeSummaryDepartment = (
  department?: WeeklyFuellingSummaryDepartment,
): string => {
  if (!department) return "";

  const totalFuelings = flatten(
    department.vehicles.flatMap((v) => v.fuelings ?? []),
  ).length;
  return `${(department as WeeklyFuellingSummaryDepartment).name.toUpperCase()} - ${department.vehicles.length} veículos - ${totalFuelings} abastecimentos`;
};

export const getFuelTotalsFromDepartmentInfos = (
  departmentInfos: WeeklyFuellingSummaryDTO["departments"][0][],
): Record<string, number> => {
  if (
    !departmentInfos ||
    departmentInfos.length === 0 ||
    !Array.isArray(departmentInfos[0]?.vehicles)
  )
    return {};

  const values = departmentInfos.reduce<Record<string, number>>((acc, dept) => {
    dept.vehicles.forEach((vehicle) => {
      const fuel = vehicle.fuel as FuelDTO;
      const fuelKey = fuel.name;

      if (!fuelKey) return;
      const amount = Number(vehicle.totalLiters ?? 0);
      if (!acc[fuelKey]) acc[fuelKey] = 0;
      acc[fuelKey] += amount;
    });
    return acc;
  }, {});

  return values;
};

export const getDepartmentWeeklyRows = (
  summaries: WeeklyFuellingSummaryDTO[],
  department: DepartmentDTO,
): AverageDepartmentTableParam[] => {
  return (
    summaries
      .map(({ weekStart, departments }) => {
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
          weekStart,
          ...(filteredDepartments.length > 0
            ? getFuelTotalsFromDepartmentInfos(filteredDepartments)
            : {}),
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) => toDate(a.weekStart).getTime() - toDate(b.weekStart).getTime(),
      ) ?? []
  );
};

export const countAllCars = (summary: WeeklyFuellingSummaryDTO): number =>
  summary.departments.reduce(
    (total, dept) => total + (dept.vehicles?.length || 0),
    0,
  );

export const countAllFuelings = (summary: WeeklyFuellingSummaryDTO): number =>
  sum(
    summary.departments.flatMap(
      (dept) => dept.vehicles?.flatMap((v) => v.fuelings?.length || 0) || [],
    ),
  );

export const getSummariesFuels = (
  summaries: WeeklyFuellingSummaryDTO[],
): FuelDTO[] => {
  const fuels: FuelDTO[] = [];

  summaries.forEach((summary) => {
    summary.departments.forEach((dept) => {
      dept.vehicles.forEach((vehicle) => {
        const fuelInSummary = fuels.find(
          (f) => f._id === (vehicle.fuel as FuelDTO)._id,
        );
        if (!fuelInSummary && typeof vehicle.fuel === "object") {
          fuels.push(vehicle.fuel as FuelDTO);
        }
      });
    });
  });

  return fuels;
};

function filterDepartments(
  summary: WeeklyFuellingSummaryDTO,
  selectedDepartment: string,
) {
  if (selectedDepartment === "__ALL__") return summary.departments;
  return summary.departments.filter(
    (d) => (d.department as DepartmentDTO)._id === selectedDepartment,
  );
}

export function getDepartmentConsumption(
  summaries: WeeklyFuellingSummaryDTO[],
  selectedDepartment: string,
): DepartmentConsumptionRow[] {
  const departmentMap = new Map<string, { id: string; name: string }>();

  const sortedSummaries = [...summaries].sort(
    (a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime(),
  );

  for (const summary of sortedSummaries) {
    for (const dep of filterDepartments(summary, selectedDepartment)) {
      const departmentId = (dep.department as DepartmentDTO)._id;
      const departmentName = (dep.department as DepartmentDTO).name;
      if (!departmentMap.has(departmentId)) {
        departmentMap.set(departmentId, {
          id: departmentId,
          name: departmentName,
        });
      }
    }
  }

  const departmentConsumptions: DepartmentConsumptionRow[] = [];

  for (const { id: departmentId, name: departmentName } of Array.from(
    departmentMap.values(),
  )) {
    let totalValue = 0;
    let totalLiters = 0;
    let totalKmHr = 0;

    for (const summary of summaries) {
      const department = summary.departments.find(
        (d) => (d.department as DepartmentDTO)._id === departmentId,
      );
      if (!department) continue;

      totalValue += department.totalValue;
      totalLiters += department.vehicles.reduce(
        (acc, v) => acc + v.totalLiters,
        0,
      );

      const previousWeekStart = addDays(new Date(summary.weekStart), -7)
        .toISOString()
        .slice(0, 10);
      const previousSummary = summaries.find(
        (s) => s.weekStart.slice(0, 10) === previousWeekStart,
      );
      if (!previousSummary) continue;

      const previousDepartment = previousSummary.departments.find(
        (d) => (d.department as DepartmentDTO)._id === departmentId,
      );
      if (!previousDepartment) continue;

      department.vehicles.forEach((vehicle) => {
        const prevVehicle = previousDepartment.vehicles.find(
          (v) => v.prefix === vehicle.prefix && v.vehicle === vehicle.vehicle,
        );
        if (
          prevVehicle &&
          vehicle.lastKm !== null &&
          prevVehicle.lastKm !== null
        ) {
          totalKmHr += vehicle.lastKm - prevVehicle.lastKm;
        }
      });
    }

    departmentConsumptions.push({
      department: departmentName,
      totalValue,
      totalLiters,
      totalKmHr,
    });
  }

  return departmentConsumptions.sort((a, b) => b.totalValue - a.totalValue);
}

export function getFuelMix({
  summaries,
  selectedDepartment,
}: GraphUtilFnParam): FuelMixItem[] {
  const map = new Map<string, number>();

  for (const summary of summaries) {
    for (const dep of filterDepartments(summary, selectedDepartment!)) {
      for (const vehicle of dep.vehicles) {
        const fuelName = (vehicle.fuel as FuelDTO).name;
        map.set(fuelName, (map.get(fuelName) ?? 0) + vehicle.totalLiters);
      }
    }
  }

  return Array.from(map.entries()).map(([label, value]) => ({
    id: label,
    label,
    value: parseFloat(value.toFixed(2)),
  }));
}

export function getTopVehiclesByConsumption({
  summaries,
  selectedDepartment,
}: GraphUtilFnParam): VehicleConsumptionRow[] {
  const LIMIT = 10;
  const map = new Map<string, VehicleConsumptionRow>();

  for (const summary of summaries) {
    for (const dep of filterDepartments(summary, selectedDepartment!)) {
      for (const vehicle of dep.vehicles) {
        const vehicleKey = `#${vehicle.prefix} - ${vehicle.vehicle}`;
        const existing = map.get(vehicleKey) ?? {
          prefix: String(vehicle.prefix),
          totalLiters: 0,
          totalValue: 0,
        };
        existing.totalLiters += vehicle.totalLiters;
        existing.totalValue += vehicle.totalValue;
        map.set(vehicleKey, existing);
      }
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.totalLiters - a.totalLiters)
    .slice(0, LIMIT);
}

function formatWeek(weekStart: string): string {
  const start = toDate(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${format(start, "dd/MM")} - ${format(end, "dd/MM/yy")}`;
}

export function getVehicleScatterSeriesByDepartment(
  summaries: WeeklyFuellingSummaryDTO[],
): VehicleScatterSeries[] {
  const deptMap = new Map<
    string,
    Map<string, { liters: number; value: number; fuel: string }>
  >();

  for (const summary of summaries) {
    for (const dep of summary.departments) {
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
        existing.liters += vehicle.totalLiters;
        existing.value += vehicle.totalValue;
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

export function getVehicleScatterSeriesByVehicle(
  summaries: WeeklyFuellingSummaryDTO[],
  selectedDepartment: string,
): VehicleScatterSeries[] {
  const sortedSummaries = [...summaries].sort(
    (a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime(),
  );

  return sortedSummaries
    .map((summary) => {
      const department = summary.departments.find(
        (d) => (d.department as DepartmentDTO)._id === selectedDepartment,
      );
      const label = formatWeek(summary.weekStart);
      if (!department) return { label, data: [] };

      return {
        label,
        data:
          department.vehicles?.map((vehicle) => ({
            fuel: (vehicle.fuel as FuelDTO).name,
            id: `#${vehicle.prefix} - ${vehicle.vehicle}`,
            x: parseFloat(vehicle.totalLiters.toFixed(2)),
            y: parseFloat((vehicle.totalKmHr ?? 0).toFixed(2)),
          })) ?? [],
      };
    })
    .filter((v) => v.data?.length > 0) as VehicleScatterSeries[];
}

export function getVehicleCostVsLitersScatter({
  summaries,
  selectedDepartment,
}: GraphUtilFnParam): VehicleScatterSeries[] {
  if (selectedDepartment === "__ALL__") {
    return getVehicleScatterSeriesByDepartment(summaries);
  }

  return getVehicleScatterSeriesByVehicle(summaries, selectedDepartment!);
}

export function getDepartmentScatter(
  summaries: WeeklyFuellingSummaryDTO[],
  selectedDepartment: string,
): DepartmentScatterSeries[] {
  const rows = getDepartmentConsumption(summaries, selectedDepartment) ?? [];
  return [
    {
      label: selectedDepartment ? "Km's x Litros" : "Departamentos",
      data: rows.map((r) => ({
        id: r.department,
        x: parseFloat(r.totalLiters.toFixed(2)),
        y: selectedDepartment
          ? parseFloat((r.totalKmHr ?? 0).toFixed(2))
          : parseFloat(r.totalValue.toFixed(2)),
      })),
    },
  ];
}

export function getEfficiencyScatter(
  summaries: WeeklyFuellingSummaryDTO[],
  selectedDepartment: string,
): VehicleScatterSeries[] {
  if (selectedDepartment === "__ALL__") {
    return getEfficiencyScatterByDepartment(summaries);
  }
  return getEfficiencyScatterByVehicle(summaries, selectedDepartment);
}

function getEfficiencyScatterByDepartment(
  summaries: WeeklyFuellingSummaryDTO[],
): VehicleScatterSeries[] {
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

  for (const summary of summaries) {
    for (const dep of summary.departments) {
      const deptName = (dep.department as DepartmentDTO).name;
      const existing = deptMap.get(deptName) ?? {
        totalKmHr: 0,
        totalLiters: 0,
        totalValue: 0,
        weeks: 0,
      };

      const kmHr = dep.vehicles.reduce((a, v) => a + (v.totalKmHr ?? 0), 0);
      const liters = dep.vehicles.reduce((a, v) => a + v.totalLiters, 0);

      existing.totalKmHr += kmHr;
      existing.totalLiters += liters;
      existing.totalValue += dep.totalValue;
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
}

function getEfficiencyScatterByVehicle(
  summaries: WeeklyFuellingSummaryDTO[],
  selectedDepartment: string,
): VehicleScatterSeries[] {
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

  for (const summary of summaries) {
    const dep = summary.departments.find(
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

      existing.totalKmHr += vehicle.totalKmHr ?? 0;
      existing.totalLiters += vehicle.totalLiters;
      existing.totalValue += vehicle.totalValue;
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
}

export function getLitersTrend({
  summaries,
  selectedDepartment,
}: GraphUtilFnParam): LitersTrendSeries[] {
  if (selectedDepartment === "__ALL__") {
    return getLitersTrendByDepartment(summaries);
  }
  return getLitersTrendByFuel(summaries, selectedDepartment!);
}

function getLitersTrendByDepartment(
  sorted: WeeklyFuellingSummaryDTO[],
): LitersTrendSeries[] {
  const deptMap = new Map<string, LitersTrendPoint[]>();

  for (const summary of sorted) {
    for (const dep of summary.departments) {
      const deptName = (dep.department as DepartmentDTO).name;
      if (!deptMap.has(deptName)) deptMap.set(deptName, []);

      const totalLiters = dep.vehicles.reduce((a, v) => a + v.totalLiters, 0);
      deptMap.get(deptName)!.push({
        week: formatWeek(summary.weekStart),
        weekStart: summary.weekStart,
        totalLiters: parseFloat(totalLiters.toFixed(2)),
      });
    }
  }

  return Array.from(deptMap.entries()).map(([label, data]) => ({
    label,
    data,
  }));
}

function getLitersTrendByFuel(
  sorted: WeeklyFuellingSummaryDTO[],
  selectedDepartment: string,
): LitersTrendSeries[] {
  const fuelMap = new Map<string, LitersTrendPoint[]>();

  for (const summary of sorted) {
    const dep = summary.departments.find(
      (d) => (d.department as DepartmentDTO)._id === selectedDepartment,
    );
    if (!dep) continue;

    for (const vehicle of dep.vehicles) {
      const fuelName = (vehicle.fuel as FuelDTO).name;
      if (!fuelMap.has(fuelName)) fuelMap.set(fuelName, []);

      const existing = fuelMap.get(fuelName)!;
      const weekEntry = existing.find((p) => p.weekStart === summary.weekStart);

      if (weekEntry) {
        weekEntry.totalLiters = parseFloat(
          (weekEntry.totalLiters + vehicle.totalLiters).toFixed(2),
        );
      } else {
        existing.push({
          week: formatWeek(summary.weekStart),
          weekStart: summary.weekStart,
          totalLiters: parseFloat(vehicle.totalLiters.toFixed(2)),
        });
      }
    }
  }

  return Array.from(fuelMap.entries()).map(([label, data]) => ({
    label,
    data,
  }));
}

export const getPieData = ({
  summaries,
  selectedDepartment,
}: GraphUtilFnParam): PieData[] => {
  const departmentsInfo = flatten(summaries.map((s) => s.departments));

  if (selectedDepartment === "__ALL__") {
    const uniqueDepartmentsInfo: WeeklyFuellingSummaryDepartment[] = [];

    departmentsInfo.forEach((deptInfo) => {
      const existing = uniqueDepartmentsInfo.find(
        (d) =>
          (d.department as DepartmentDTO)._id ===
          (deptInfo.department as DepartmentDTO)._id,
      );

      if (existing) {
        existing.totalValue += deptInfo.vehicles.reduce(
          (sum, v) => sum + v.totalLiters,
          0,
        );
      } else {
        uniqueDepartmentsInfo.push({
          ...deptInfo,
          totalValue: deptInfo.vehicles.reduce(
            (sum, v) => sum + v.totalLiters,
            0,
          ),
        });
      }
    });
    return uniqueDepartmentsInfo.map((d) => ({
      id: (d.department as DepartmentDTO)._id,
      label: (d.department as DepartmentDTO).name,
      value: d.totalValue,
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

const monetaryFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
export const toMonetary = (n: number): string => monetaryFormatter.format(n);

export const ALL = "__ALL__";

export const getCarTotalKmHr = (fuelings: FuelingData[]): number | null => {
  const kmHrs = pluck("kmHr", fuelings);
  const kmHrsWithoutNull = reject(isNil, kmHrs);
  const minkmHr = Math.min(...(kmHrsWithoutNull ?? []));
  const maxkmHr = Math.max(...(kmHrsWithoutNull ?? []));
  return minkmHr && maxkmHr && maxkmHr > minkmHr ? maxkmHr - minkmHr : null;
};

export const getCarTotalValue = (
  fuelings: FuelingData[],
  fuelPrice: number,
): number => fuelings.reduce((acc, f) => acc + f.quantity * fuelPrice, 0);

export const departmentHasPrefix = ({
  department,
  prefix,
}: {
  department: WeeklyFuellingSummaryDepartment;
  prefix: number;
}): boolean => {
  const prefixes = pluck("prefix", department.vehicles ?? []);
  return prefixes.includes(prefix);
};

export const countAllLiters = (summary: WeeklyFuellingSummaryDTO): number =>
  sum(
    summary.departments.flatMap(
      (dept) =>
        dept.vehicles?.flatMap(
          (v) => v.fuelings?.map((f) => f.quantity) || [],
        ) || [],
    ),
  );

export const countAllKms = (summary: WeeklyFuellingSummaryDTO): number => {
  let sum = 0;
  summary.departments.forEach((dept) =>
    dept.vehicles?.forEach((vehicle) => {
      sum += getCarTotalKmHr(vehicle.fuelings ?? []) ?? 0;
    }),
  );
  return sum;
};

export const countAllValue = (
  summary: WeeklyFuellingSummaryDTO,
  fuels: FuelDTO[],
): number =>
  summary.departments.reduce(
    (total, dept) =>
      total +
      (dept.vehicles?.reduce(
        (acc, v) =>
          acc +
          (v.fuelings?.reduce(
            (a, f) =>
              a +
              f.quantity *
                (getVehicleFuel(v as WeeklyFuellingSummaryVehicle, fuels)
                  ?.price ?? 0),
            0,
          ) ?? 0),
        0,
      ) || 0),
    0,
  );

export const getVehicleFuel = (
  vehicle: WeeklyFuellingSummaryVehicle,
  fuels: FuelDTO[],
): FuelPriceVersionDTO | null => {
  const fuel = fuels.find((f) => {
    return f._id === (vehicle.fuel as FuelDTO)._id;
  });

  return fuel ? (fuel.currentPriceVersion as FuelPriceVersionDTO) : null;
};

export const prepareSummaryPayload = (
  payload: Partial<WeeklyFuellingSummaryDTO>,
): Partial<WeeklyFuellingSummaryDTO> => ({
  ...payload,
  departments: payload.departments?.map((d) => ({
    ...d,
    department: (d.department as DepartmentDTO)?._id ?? d.department,
    totalValue: 0,
    vehicles: d.vehicles?.map((v) => ({
      ...v,
      fuel: (v.fuel as FuelDTO)?._id ?? v.fuel,
      lastKm: null,
      totalValue: 0,
      totalKmHr: undefined,
      totalLiters: 0,
    })),
  })),
  weekStart: undefined,
  createdAt: undefined,
});
