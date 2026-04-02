import { format, isSameDay, toDate } from "date-fns";
import type {
  CarEntry,
  FuelingData,
  LocalStorageData,
  TabData,
} from "../../../lib/repository/weeklyFuellingSummary/types";
import { flatten, pluck, sum } from "ramda";
import type { AverageDepartmentTableParam } from "./components/types";
import type { WeeklyFuellingSummaryDTO } from "@/dto/WeeklyFuellingSummaryDTO";
import type { DepartmentDTO } from "@/dto";
import type { FuelDTO } from "@/dto/FuelDTO";
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
    activeTab: 1,
    data: [],
    pdfData: { items: [], opened: false },
  };
  const data: LocalStorageData = rawData
    ? await JSON.parse(rawData)
    : emptyData;
  return data;
};

export const populateLocalStorage = ({
  departments,
  fuels,
  localStorageData,
}: {
  departments: DepartmentDTO[];
  fuels: FuelDTO[];
  localStorageData: LocalStorageData;
}): LocalStorageData => {
  return {
    ...localStorageData,
    data: localStorageData.data.map((tabData) => ({
      ...tabData,
      department:
        typeof tabData.department === "string"
          ? (departments.find((dept) => dept._id === tabData.department) ??
            tabData.department)
          : tabData.department,
      carEntries: tabData.carEntries.map((carEntry) => ({
        ...carEntry,
        fuel:
          typeof carEntry.fuel === "string"
            ? (fuels.find(
                (fuel) =>
                  fuel._id === carEntry.fuel ||
                  String(fuel.name).toLowerCase() ===
                    String(carEntry.fuel).toLowerCase(),
              ) ?? carEntry.fuel)
            : carEntry.fuel,
      })),
    })),
  };
};

export const unpopulateLocalStorage = (
  data: LocalStorageData,
): LocalStorageData => {
  return {
    ...data,
    data: data.data.map((tabData) => ({
      ...tabData,
      department:
        typeof tabData.department === "object"
          ? (tabData.department as DepartmentDTO)._id
          : tabData.department,
      carEntries: tabData.carEntries.map((carEntry) => ({
        ...carEntry,
        fuel:
          typeof carEntry.fuel === "object"
            ? (carEntry.fuel as FuelDTO)._id
            : carEntry.fuel,
      })),
    })),
  };
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

export const removeAllCarEntries = (tabData: TabData): TabData => ({
  ...tabData,
  carEntries: [],
});

export const sortCarFuelings = (fuelings: FuelingData[]): FuelingData[] =>
  [...fuelings].sort((a, b) =>
    // in case fuelings in the same day
    isSameDay(toDate(a.date), toDate(b.date))
      ? // we consider the kmHr
        (a.kmHr ?? 0) - (b.kmHr ?? 0)
      : // or just the date
        toDate(a.date).getTime() - toDate(b.date).getTime(),
  );

export const prefixExistsInTabData = ({
  prefix,
  tabData: { carEntries },
}: {
  tabData: TabData;
  prefix: number;
}) => {
  const prefixes = pluck("prefix", carEntries ?? []);

  return prefixes.includes(prefix);
};

export const resumeTabData = (tabData?: TabData): string => {
  if (!tabData) return "";

  const totalFuelings = flatten(
    tabData.carEntries.map((carEntry) => carEntry.fuelings),
  ).length;
  return `${(tabData.department as DepartmentDTO).name.toUpperCase()} - ${tabData.carEntries.length} veículos - ${totalFuelings} abastecimentos`;
};

export const getFuelTotalsFromDepartment = (
  department: WeeklyFuellingSummaryDTO["departments"][0],
): Record<string, number> => {
  if (!department || !Array.isArray(department.vehicles)) return {};

  return department.vehicles.reduce<Record<string, number>>((acc, vehicle) => {
    const fuel = vehicle.fuel;

    const fuelKey =
      fuel && typeof fuel === "object" && "name" in fuel
        ? String((fuel as any).name).toLowerCase()
        : String(fuel ?? "")
            .trim()
            .toLowerCase();

    if (!fuelKey) return acc;

    const amount = Number(vehicle.totalLiters ?? 0);
    if (!acc[fuelKey]) acc[fuelKey] = 0;
    acc[fuelKey] += amount;

    return acc;
  }, {});
};

export const getDepartmentWeeklyRows = (
  summaries: WeeklyFuellingSummaryDTO[],
  department: string,
): AverageDepartmentTableParam[] => {
  return (
    summaries
      .map(({ weekStart, departments }) => {
        const dept = departments.find((d) => d.name === department);

        return {
          weekStart,
          ...(dept ? getFuelTotalsFromDepartment(dept) : {}),
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) => toDate(a.weekStart).getTime() - toDate(b.weekStart).getTime(),
      ) ?? []
  );
};

export const countAllCars = (tabsData: TabData[]): number =>
  sum(tabsData.map((tabData) => tabData.carEntries.length));

export const countAllFuelings = (tabsData: TabData[]): number =>
  sum(
    tabsData.map((tabData) =>
      sum(tabData.carEntries.map((car) => car.fuelings.length)),
    ),
  );

export const countAllLiters = (tabsData: TabData[]): number =>
  sum(
    tabsData.map((tabData) =>
      sum(
        tabData.carEntries.map((car) =>
          sum(car.fuelings.map((fueling) => fueling.quantity)),
        ),
      ),
    ),
  );

export const countAllKms = (tabsData: TabData[]): number => {
  let sum = 0;
  tabsData.forEach((tabData) =>
    tabData.carEntries.forEach((car) => {
      const firstFuelingKm = car.fuelings[0].kmHr;
      const lastFuelingKm = car.fuelings[car.fuelings.length - 1].kmHr;

      if (firstFuelingKm && lastFuelingKm && firstFuelingKm !== lastFuelingKm)
        sum += lastFuelingKm - firstFuelingKm;
    }),
  );
  return sum;
};

export const getCarTotalValue = (
  car: CarEntry,
  weeklyFuelingSummary: WeeklyFuellingSummaryDTO | null,
  departmentId: string,
): number => {
  if (!weeklyFuelingSummary) return 0;

  const department = weeklyFuelingSummary.departments.find(
    (dept) => (dept.department as DepartmentDTO)._id === departmentId,
  );

  if (!department) return 0;

  const departmentCar = department.vehicles.find(
    (vehicle) => car.prefix === vehicle.prefix,
  );

  return departmentCar ? departmentCar.totalValue : 0;
};

export const getWeeklyFuelsTotals = (
  weeklyFuelingSummary: WeeklyFuellingSummaryDTO,
) => {
  const fuels: FuelDTO[] = [];

  weeklyFuelingSummary.departments.forEach((dept) => {
    dept.vehicles.forEach((vehicle) => {
      const fuelInSummary = fuels.find(
        (f) => f._id === (vehicle.fuel as FuelDTO)._id,
      );
      if (!fuelInSummary && typeof vehicle.fuel === "object") {
        fuels.push(vehicle.fuel as FuelDTO);
      }
    });
  });

  return fuels;
};
