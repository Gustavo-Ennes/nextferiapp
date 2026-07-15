import type {
  WeeklyFuellingSummaryDepartment,
  WeeklyFuellingSummaryVehicle,
} from "@/dto/WeeklyFuellingSummaryDTO";
import type { FuelingData } from "@/models/types";
import { getDaysInMonth, set } from "date-fns";
import { countAllKms, countAllLiters, countAllValue } from "./utils";
import { WeeklyFuellingSummaryModel } from "@/models/WeeklyFuellingSummary";
import { Types } from "mongoose";
import { sum, pluck } from "ramda";

const MIN_TABS = 1;
const MAX_TABS = 5;
const MIN_CAR_COUNT = 1;
const MAX_CAR_COUNT = 10;
const MIN_FUELINGS = 5;
const MAX_FUELINGS = 15;
const MAX_PER_FUELING = 249;
const MIN_KM = 1000;
const MAX_KM = 950000;

const getRamdomBool = () => Math.random() * 4 > 1;

function randomDateInJuly(): Date {
  const date = Math.floor(
    1 + Math.random() * getDaysInMonth(new Date().toISOString()),
  );
  return set(new Date(), { date });
}

function generateFuelingData(count: number): FuelingData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    date: randomDateInJuly().toISOString(),
    quantity: MIN_FUELINGS + Math.random() * MAX_PER_FUELING,
    kmHr: getRamdomBool() ? Math.round(MIN_KM + Math.random() * MAX_KM) : null,
  }));
}

// BUILDAR, RODAR TESTAR E TESTAR MANUALMENTE

function generateVehicles(
  count: number,
  seed: number,
): WeeklyFuellingSummaryVehicle[] {
  return Array.from({ length: count }, (_, i) => {
    const fuelings = generateFuelingData(
      MIN_FUELINGS + Math.round(Math.random() * MAX_FUELINGS),
    );
    const fakeSummary = new WeeklyFuellingSummaryModel({
      weekStart: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      departments: [
        {
          department: new Types.ObjectId().toString(),
          name: `Departamento ${seed + 1}`,
          totalValue: 0,
          vehicles: [
            {
              vehicle: `Veículo #${seed++}`,
              prefix: 100 + seed * 10 + i,
              fuel: {
                _id: "fuelId" + seed,
                name: `Combustível ${seed}`,
                unit: "L",
                price: 5 + Math.random() * 5,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              fuelings,
            },
          ],
        },
      ],
    });

    return {
      vehicle: `Veículo #${seed++}`,
      prefix: 100 + seed * 10 + i,
      fuel: {
        _id: "fuelId" + seed,
        name: `Combustível ${seed}`,
        unit: "L",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      fuelings,
      totalLiters: countAllLiters(fakeSummary),
      totalValue: countAllValue(fakeSummary, []),
      totalKmHr: countAllKms(fakeSummary),
      lastKm: 0,
    };
  });
}

export const mockedSummaryDepartments: () => WeeklyFuellingSummaryDepartment[] =
  () => {
    const length = MIN_TABS + Math.round(Math.random() * MAX_TABS);
    const carCount = MIN_CAR_COUNT + Math.round(Math.random() * MAX_CAR_COUNT);

    return Array.from({ length }, (_, tabIndex) => {
      const vehicles = generateVehicles(carCount, tabIndex);
      const totalValue = sum(pluck("totalValue", vehicles) ?? []) ?? 0;

      return {
        order: tabIndex,
        department: new Types.ObjectId().toString(),
        name: `Departamento ${tabIndex + 1}`,
        vehicles,
        totalValue,
      };
    });
  };
