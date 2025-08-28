import { fuelList } from "./utils";
import type { FuelingData, TabData } from "./types";

const MIN_TABS = 1;
const MAX_TABS = 5;
const MIN_CAR_COUNT = 1;
const MAX_CAR_COUNT = 10;
const MIN_FUELINGS = 5;
const MAX_FUELINGS = 15;
const MAX_PER_FUELING = 249;
const MIN_KM = 1000;
const MAX_KM = 950000;

const getRamdomBool = () => Math.random() * 2 > 1;

function randomDateInJuly(index: number): Date {
  const day = 1 + ((index * 3) % 28);
  return new Date(`2025-07-${String(day).padStart(2, "0")}T08:00:00`);
}

function generateFuelingData(count: number): FuelingData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    date: randomDateInJuly(i + 1),
    quantity: MIN_FUELINGS + Math.random() * MAX_PER_FUELING,
    ...(getRamdomBool() && {
      kmHr: Math.round(MIN_KM + Math.random() * MAX_KM),
    }),
  }));
}

function generateCarEntries(
  count: number,
  seed: number
): TabData["carEntries"] {
  return Array.from({ length: count }, (_, i) => ({
    vehicle: `Veículo #${seed++}`,
    prefix: 100 + seed * 10 + i,
    fuel: fuelList[Math.floor(Math.random() * fuelList.length)],
    fuelings: generateFuelingData(
      MIN_FUELINGS + Math.round(Math.random() * MAX_FUELINGS)
    ),
  }));
}

export const mockedTabsData: () => TabData[] = () => {
  const length = MIN_TABS + Math.round(Math.random() * MAX_TABS);
  const carCount = MIN_CAR_COUNT + Math.round(Math.random() * MAX_CAR_COUNT);

  return Array.from({ length }, (_, tabIndex) => {
    return {
      index: tabIndex,
      department: `Departamento ${tabIndex + 1}`,
      carEntries: generateCarEntries(carCount, tabIndex),
    };
  });
};
