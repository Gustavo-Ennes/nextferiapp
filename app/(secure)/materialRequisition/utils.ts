import { format, isSameDay, toDate } from "date-fns";
import type {
  FuelingData,
  FuelType,
  LocalStorageData,
  TabData,
} from "../../../lib/repository/weeklyFuellingSummary/types";
import { flatten, pluck } from "ramda";
import type { AverageDepartmentTableParam } from "./components/types";
import type { WeeklyFuellingSummaryDTO } from "@/dto/WeeklyFuellingSummaryDTO";
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
};

export const a11yProps = (index: number) => ({
  id: `tabPanel-${index}`,
  "aria-controls": `tabPanel-${index}`,
});

export const fuelList: FuelType[] = ["gas", "s500", "s10", "arla"];

export const getLabel = ({ quantity, date }: FuelingData): string =>
  `${format(new Date(date), "dd/MM/yy")} - ${quantity.toFixed(3)}L.`;

export const removeAllCarEntries = (tabData: TabData): TabData => ({
  ...tabData,
  carEntries: [],
});

export const sortCarFuelings = (fuelings: FuelingData[]): FuelingData[] =>
  fuelings.sort((a, b) =>
    // in case fuelings in the same day
    isSameDay(a.date, b.date)
      ? // we consider the kmHr
        (a.kmHr ?? 0) - (b.kmHr ?? 0)
      : // or just the date
        toDate(a.date).getTime() - toDate(b.date).getTime()
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
    tabData.carEntries.map((carEntry) => carEntry.fuelings)
  ).length;
  return `${tabData.department} - ${tabData.carEntries.length} veículos - ${totalFuelings} abastecimentos`;
};

export const getDepartmentWeeklyRows = (
  summaries: WeeklyFuellingSummaryDTO[],
  department: string
): AverageDepartmentTableParam[] => {
  return (
    summaries
      .map(({ weekStart, departments }) => {
        const dept = departments.find((d) => d.name === department);

        return {
          weekStart,
          ...(dept?.fuelTotals ?? {}),
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) => toDate(a.weekStart).getTime() - toDate(b.weekStart).getTime()
      ) ?? []
  );
};
