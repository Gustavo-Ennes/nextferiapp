import { startOfDaySP } from "@/app/utils";
import type { WeeklyFuellingSummaryDTO } from "@/dto/WeeklyFuellingSummaryDTO";
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

const FUEL_TYPES = [
  { name: "Gasolina", unit: "L", price: 6.5 },
  { name: "Diesel", unit: "L", price: 7.2 },
  { name: "Arla", unit: "L", price: 5.8 },
  { name: "S500", unit: "L", price: 7.0 },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

export function generateWeeklyFuellingSummaryMock(
  params: WeeklySummaryMockParam,
): WeeklyFuellingSummaryDTO[] {
  const {
    weeks,
    departmentsPerWeek,
    vehiclesPerDepartment,
    fuellingsPerVehicle,
    litersPerFuelling,
  } = params;
  const departmentSummaries: WeeklyFuellingSummaryDTO[] = [];

  for (let weekId = 0; weekId < weeks; weekId++) {
    const departmentQuantity = randomInt(
      departmentsPerWeek.min,
      departmentsPerWeek.max,
    );
    const weekStart = startOfWeek(
      addWeeks(startOfDaySP(new Date()), weekId),
    ).toISOString();
    const weeklySummary: WeeklyFuellingSummaryDTO = {
      _id: new Types.ObjectId().toString(),
      weekStart,
      createdAt: weekStart,
      departments: [],
    };

    for (let deptId = 0; deptId < departmentQuantity; deptId++) {
      const vehiclesQuantity = randomInt(
        vehiclesPerDepartment.min,
        vehiclesPerDepartment.max,
      );

      const vehicles: WeeklyFuellingSummaryDTO["departments"][0]["vehicles"] =
        [];

      for (let vehicleId = 0; vehicleId < vehiclesQuantity; vehicleId++) {
        const fuellingQuantity = randomInt(
          fuellingsPerVehicle.min,
          fuellingsPerVehicle.max,
        );
        const selectedFuel = randomFrom(FUEL_TYPES);

        let totalLiters = 0;
        let totalValue = 0;

        for (let fuellingId = 0; fuellingId < fuellingQuantity; fuellingId++) {
          const litersQuantity = randomInt(
            litersPerFuelling.min,
            litersPerFuelling.max,
          );
          totalLiters += litersQuantity;
          totalValue += Number(
            (litersQuantity * selectedFuel.price).toFixed(2),
          );
        }

        const vehicleSummary: WeeklyFuellingSummaryDTO["departments"][0]["vehicles"][0] =
          {
            vehicle: `Vehicle ${vehicleId + 1}`,
            fuel: {
              _id: new Types.ObjectId().toString(),
              name: selectedFuel.name,
              unit: selectedFuel.unit,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            totalValue: Number(totalValue.toFixed(2)),
            prefix: vehicleId,
            totalLiters,
            lastKm: null,
          };

        vehicles.push(vehicleSummary);
      }

      const departmentSummary: WeeklyFuellingSummaryDTO["departments"][0] = {
        department: new Types.ObjectId().toString(),
        totalValue: vehicles.reduce(
          (sum, vehicle) => sum + vehicle.totalValue,
          0,
        ),
        name: `Departamento ${deptId + 1}`,
        vehicles,
      };

      weeklySummary.departments.push(departmentSummary);
    }

    departmentSummaries.push(weeklySummary);
  }

  return departmentSummaries;
}
