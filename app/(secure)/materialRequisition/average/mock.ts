import { startOfDaySP } from "@/app/utils";
import type {
  FuellingSummaryDepartment,
  FuellingSummaryVehicle,
  WeeklyFuellingSummary,
} from "@/models/types";
import { addWeeks, startOfWeek } from "date-fns";
import { Types } from "mongoose";

type Range = {
  min: number;
  max: number;
};

type WeeklySummaryMockParam = {
  weeks: number;
  departmentsPerWeek: Range;
  vehiclesPerDepartment: Range;
  fuellingsPerVehicle: Range;
  litersPerFuelling: Range;
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

export function generateWeeklyFuellingSummaryMock(
  params: WeeklySummaryMockParam
): WeeklyFuellingSummary[] {
  const {
    weeks,
    departmentsPerWeek,
    vehiclesPerDepartment,
    fuellingsPerVehicle,
    litersPerFuelling,
  } = params;
  const departmentSummaries: WeeklyFuellingSummary[] = [];

  for (let weekId = 0; weekId < weeks; weekId++) {
    const departmentQuantity = randomInt(
      departmentsPerWeek.min,
      departmentsPerWeek.max
    );
    const weekStart = startOfWeek(
      addWeeks(startOfDaySP(new Date()), weekId)
    ).toISOString();
    const weeklySummary: WeeklyFuellingSummary = {
      _id: new Types.ObjectId().toString(),
      weekStart,
      createdAt: weekStart,
      departments: [],
    };

    for (let deptId = 0; deptId < departmentQuantity; deptId++) {
      const vehiclesQuantity = randomInt(
        vehiclesPerDepartment.min,
        vehiclesPerDepartment.max
      );
      const departmentSummary: FuellingSummaryDepartment = {
        name: `Departamento ${deptId + 1}`,
        fuelTotals: {
          gas: 0,
          arla: 0,
          s10: 0,
          s500: 0,
        },
        vehicles: [],
      };

      for (let vehicleId = 0; vehicleId < vehiclesQuantity; vehicleId++) {
        const fuellingQuantity = randomInt(
          fuellingsPerVehicle.min,
          fuellingsPerVehicle.max
        );
        const vehicleSummary: FuellingSummaryVehicle = {
          vehicle: `Vehicle ${vehicleId + 1}`,
          fuelType: randomFrom(["gas", "arla", "s10", "s500"]),
          prefix: vehicleId,
          totalLiters: 0,
        };

        for (let fuellingId = 0; fuellingId < fuellingQuantity; fuellingId++) {
          const litersQuantity = randomInt(
            litersPerFuelling.min,
            litersPerFuelling.max
          );
          vehicleSummary.totalLiters += litersQuantity;
        }

        departmentSummary.fuelTotals[vehicleSummary.fuelType] +=
          vehicleSummary.totalLiters;
        departmentSummary.vehicles.push(vehicleSummary);
      }

      weeklySummary.departments.push(departmentSummary);
    }

    departmentSummaries.push(weeklySummary);
  }

  return departmentSummaries;
}
