import { format } from "date-fns";
import type { FuelingData, FuelType, LocalStorageData, TabData } from "./types";
// import { mockedTabsData } from "./mock";

export const setLocalStorageData = (data: LocalStorageData) => {
  localStorage.setItem("feriapp", JSON.stringify(data));
  dispatchEvent(new Event("feriapp"));
};

export const getLocalStorageData = async (): Promise<LocalStorageData> => {
  const rawData = localStorage.getItem("feriapp") as string;
  const data: LocalStorageData = await JSON.parse(rawData);
  return data;

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
