import dbConnect from "@/lib/database/database";
import type { IFuel } from "@/models/Fuel";
import type { IFuelPriceVersion } from "@/models/FuelPriceVersion";
import {
  WeeklyFuellingSummaryModel,
  type WeeklyFuellingSummary,
} from "@/models/WeeklyFuellingSummary";

export async function addTotalValuesWeeklySummaries() {
  await dbConnect();
  const summaries =
    await WeeklyFuellingSummaryModel.find<WeeklyFuellingSummary>();

  for (let i = 0; i < summaries.length; i++) {
    const summary = summaries[i];

    for (let j = 0; j < summary.departments.length; j++) {
      const dept = summary.departments[j];
      let departmentTotalValue = 0;

      for (let k = 0; k < dept.vehicles.length; k++) {
        const vehicle = dept.vehicles[k];
        let totalLiters = 0;
        let pricePerLiter = 0;
        let vehicleTotalValue = 0;

        if (
          vehicle.fuel &&
          typeof vehicle.fuel === "object" &&
          "currentPriceVersion" in vehicle.fuel
        ) {
          const fuelRecord = vehicle.fuel as IFuel;
          totalLiters += vehicle.totalLiters;
          pricePerLiter = (fuelRecord.currentPriceVersion as IFuelPriceVersion)
            .price;
          vehicleTotalValue += vehicle.totalLiters * pricePerLiter;
        }
        vehicle.totalValue = Number(vehicleTotalValue.toFixed(2));
        departmentTotalValue += totalLiters * pricePerLiter;
      }
      dept.totalValue = Number(departmentTotalValue.toFixed(2));
    }
    await summary.save();
  }

  console.log("Migration: addtotalValuesWeeklySummaries completed");
}

addTotalValuesWeeklySummaries().catch(console.error);
