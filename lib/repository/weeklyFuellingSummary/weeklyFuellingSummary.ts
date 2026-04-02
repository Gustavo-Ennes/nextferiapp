import type { LocalStorageData } from "@/lib/repository/weeklyFuellingSummary/types";
import { startOfDaySP } from "@/app/utils";
import { WeeklyFuellingSummaryModel } from "@/models/WeeklyFuellingSummary";
import type {
  FuellingSummaryVehicle,
  FuellingSummaryDepartment,
} from "@/models/types";
import { startOfWeek } from "date-fns";
import { isObjectIdOrHexString, Types } from "mongoose";
import { parseWeeklySummaries, toWeeklySummaryDTO } from "./parse";
import type { WeeklyFuellingSummaryDTO } from "@/dto/WeeklyFuellingSummaryDTO";
import dbConnect from "@/lib/database/database";
import { FuelRepository } from "../fuel/fuel";
import { DepartmentRepository } from "../department/department";

export const WeeklyFuellingSummaryRepository = {
  async findByWeekStart(): Promise<WeeklyFuellingSummaryDTO | null> {
    await dbConnect();

    const weekStart = startOfWeek(startOfDaySP(new Date()), {
      weekStartsOn: 1,
    });
    const summary = await WeeklyFuellingSummaryModel.findOne({ weekStart })
      .populate({
        path: "departments.department",
        model: "Department",
      })
      .populate({
        path: "departments.vehicles.fuel",
        model: "Fuel",
      });

    if (!summary) return null;

    const parsedSummary = toWeeklySummaryDTO(summary);
    return parsedSummary;
  },

  async find(): Promise<WeeklyFuellingSummaryDTO[]> {
    await dbConnect();

    const summaries = await WeeklyFuellingSummaryModel.find()
      .populate({
        path: "departments.department",
        model: "Department",
      })
      .populate({
        path: "departments.vehicles.fuel",
        model: "Fuel",
      });
    const parsedSummaries = parseWeeklySummaries(summaries);

    return parsedSummaries;
  },

  async delete(id: string): Promise<void> {
    await dbConnect();

    if (!id || !isObjectIdOrHexString(id)) throw new Error("Id not found");

    const summaries = await this.find();
    const summary = summaries.find((s) => s._id === id);
    if (!summary) throw new Error("Summary not found");

    await WeeklyFuellingSummaryModel.deleteOne({ _id: id });
  },

  async createOrUpdate(
    payload: LocalStorageData,
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

    const [allFuels, existingDepartments] = await Promise.all([
      FuelRepository.findWithoutPagination!({}),
      DepartmentRepository.findWithoutPagination!({}),
    ]);

    for (const dept of payloadDepartments) {
      const vehiclesTotals: FuellingSummaryVehicle[] = [];

      let departmentDocument = existingDepartments.find(
        (d) => d._id === dept.department,
      );
      let departmentTotalValue = 0;

      if (!departmentDocument) {
        throw new Error(`Department ${dept.department} not found in database.`);
      }

      for (const car of dept.carEntries) {
        let totalLiters = 0;
        let lastKm: number | null = null;

        for (const f of car.fuelings) {
          totalLiters += f.quantity;
          lastKm = f.kmHr;
        }

        const fuelRecord = allFuels.find((fuel) => fuel._id === car.fuel);

        if (!fuelRecord) {
          throw new Error(`Fuel ${car.fuel} not found in database.`);
        }

        let pricePerLiter = 0;
        if (
          fuelRecord &&
          fuelRecord.currentPriceVersion &&
          typeof fuelRecord.currentPriceVersion === "object" &&
          "price" in fuelRecord.currentPriceVersion
        ) {
          pricePerLiter = Number(
            (fuelRecord.currentPriceVersion as any).price ?? 0,
          );
        }
        const totalValue = Number((pricePerLiter * totalLiters).toFixed(2));

        vehiclesTotals.push({
          vehicle: car.vehicle,
          prefix: car.prefix,
          fuel: new Types.ObjectId(fuelRecord._id),
          totalLiters,
          totalValue,
          lastKm,
        });

        departmentTotalValue += totalValue;
      }

      departments.push({
        department: departmentDocument._id,
        totalValue: departmentTotalValue,
        name: departmentDocument.name,
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
      },
    )
      .populate({
        path: "departments.department",
        model: "Department",
      })
      .populate({
        path: "departments.vehicles.fuel",
        model: "Fuel",
      });

    const parsedSummary = toWeeklySummaryDTO(summary);
    return parsedSummary;
  },
};
