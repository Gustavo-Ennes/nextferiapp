import type { LocalStorageData } from "@/lib/repository/weeklyFuellingSummary/types";
import { startOfDaySP } from "@/app/utils";
import { WeeklyFuellingSummaryModel } from "@/models/WeeklyFuellingSummary";
import type {
  FuellingSummaryVehicle,
  FuelTotals,
  FuellingSummaryDepartment,
} from "@/models/types";
import { startOfWeek } from "date-fns";
import { isObjectIdOrHexString } from "mongoose";
import { parseWeeklySummaries, toWeeklySummaryDTO } from "./parse";
import type { WeeklyFuellingSummaryDTO } from "@/dto/WeeklyFuellingSummaryDTO";
import dbConnect from "@/lib/database/database";

export const WeeklyFuellingSummaryRepository = {
  async findByWeekStart(): Promise<WeeklyFuellingSummaryDTO | null> {
    await dbConnect();

    const weekStart = startOfWeek(startOfDaySP(new Date()), {
      weekStartsOn: 1,
    });
    const summary = await WeeklyFuellingSummaryModel.findOne({ weekStart });

    if (!summary) return null;

    const parsedSummary = toWeeklySummaryDTO(summary);
    return parsedSummary;
  },

  async find(): Promise<WeeklyFuellingSummaryDTO[]> {
    await dbConnect();

    const summaries = await WeeklyFuellingSummaryModel.find();
    const parsedSummaries = parseWeeklySummaries(summaries);

    return parsedSummaries;
  },

  async delete(id: string): Promise<void> {
    await dbConnect();

    if (!id || !isObjectIdOrHexString(id)) throw new Error("Id not found");

    await WeeklyFuellingSummaryModel.deleteOne({ _id: id });
  },

  async createOrUpdate(
    payload: LocalStorageData
  ): Promise<WeeklyFuellingSummaryDTO | null> {
    await dbConnect();

    const payloadDepartments = payload.data;

    if (!payloadDepartments || payloadDepartments.length === 0) {
      console.info("No data found in localstorage for fuelling weekly summary");
      return null;
    }

    const weekStart = startOfWeek(startOfDaySP(new Date()), {
      weekStartsOn: 1,
    });

    const departments: FuellingSummaryDepartment[] = [];

    for (const dept of payloadDepartments) {
      const fuelTotals: FuelTotals = {
        gas: 0,
        s10: 0,
        s500: 0,
        arla: 0,
      };

      const vehiclesTotals: FuellingSummaryVehicle[] = [];

      for (const car of dept.carEntries) {
        let totalLiters = 0;
        let lastKm: number | undefined;

        for (const f of car.fuelings) {
          totalLiters += f.quantity;
          lastKm = f.kmHr;
        }

        fuelTotals[car.fuel] += totalLiters;

        vehiclesTotals.push({
          vehicle: car.vehicle,
          prefix: car.prefix,
          fuelType: car.fuel,
          totalLiters,
          lastKm,
        });
      }

      departments.push({
        name: dept.department,
        fuelTotals,
        vehicles: vehiclesTotals,
      });
    }

    const summary = await WeeklyFuellingSummaryModel.findOneAndUpdate(
      { weekStart },
      {
        $set: {
          departments,
          weekStart,
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    const parsedSummary = toWeeklySummaryDTO(summary);
    return parsedSummary;
  },
};
