import { format } from "date-fns";
import { FuelingData, FuelType, LocalStorageData, TabData } from "./types";
// import { mockedTabsData } from "./mock";

export const getLocalStorageData = (): LocalStorageData => {
  const data: TabData[] = JSON.parse(
    localStorage.getItem("tabsData") as string
  );
  const activeTab = parseInt(localStorage.getItem("activeTab") ?? "0");

  return { data, activeTab };

  // USE TO GENERATE RANDOM DATA(config in mock.ts)
  // const data = mockedTabsData();
  // return {
  //   data,
  //   activeTab: Math.floor(Math.random() * data.length),
  // };
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
