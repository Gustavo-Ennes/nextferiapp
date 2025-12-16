import type { LocalStorageData } from "@/lib/repository/weeklyFuellingSummary/types";
import { startOfDaySP } from "@/app/utils";
import {
  WeeklyFuellingSummaryModel,
  type WeeklyFuellingSummary,
} from "@/models/WeeklyFuellingSummary";
import type {
  FuellingSummaryVehicle,
  FuelTotals,
  FuellingSummaryDepartment,
} from "@/models/types";
import { startOfWeek } from "date-fns";
import { isObjectIdOrHexString, Types } from "mongoose";

export const FuelingWeeklySummaryRepository = {
  async find(id: string): Promise<WeeklyFuellingSummary | null> {
    return WeeklyFuellingSummaryModel.findById(id);
  },

  async delete(id: Types.ObjectId): Promise<void> {
    if (!id || !isObjectIdOrHexString(id)) throw new Error("Id not found");

    await WeeklyFuellingSummaryModel.deleteOne({ _id: id });
  },

  async createOrUpdate(
    payload: LocalStorageData,
    id?: string
  ): Promise<WeeklyFuellingSummary | null> {
    const payloadDepartments = payload.data;
    const isUpdate = !!id;
    const weekStart = startOfWeek(startOfDaySP(new Date()), {
      weekStartsOn: 1,
    });

    let summaryToUpdate: WeeklyFuellingSummary | null = null;
    let actualWeekSummary: WeeklyFuellingSummary | null =
      await WeeklyFuellingSummaryModel.findOne({ weekStart });

    if (id && !isObjectIdOrHexString(id))
      throw new Error("Id must be an ObjectId.");

    if (!payloadDepartments || payloadDepartments.length === 0) {
      console.info(`No data found in localstorage for fuelling weekly summary`);
      return null;
    }

    summaryToUpdate = await WeeklyFuellingSummaryModel.findById(id);

    if (isUpdate && !summaryToUpdate)
      throw new Error("Fuelling weekly summary not found.");
    if (!isUpdate && actualWeekSummary) summaryToUpdate = actualWeekSummary;

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
        let lastKm = undefined;

        for (const f of car.fuelings) {
          totalLiters += f.quantity;
          lastKm = f.kmHr;
        }

        // adiciona ao total por combustível
        fuelTotals[car.fuel] += totalLiters;

        // adiciona aos veículos
        vehiclesTotals.push({
          vehicle: car.vehicle,
          prefix: car.prefix,
          fuelType: car.fuel,
          totalLiters,
          lastKm,
        });
      }
      departments.push({
        fuelTotals,
        name: dept.department,
        vehicles: vehiclesTotals,
      });
    }

    if (summaryToUpdate) {
      summaryToUpdate.weekStart = weekStart;
      summaryToUpdate.departments = departments;
    } else {
      summaryToUpdate = new WeeklyFuellingSummaryModel({
        weekStart,
        departments,
        createdAt: new Date(),
      });
    }
    const savedSummary = await (
      summaryToUpdate as WeeklyFuellingSummary
    ).save();

    return savedSummary;
  },
};
