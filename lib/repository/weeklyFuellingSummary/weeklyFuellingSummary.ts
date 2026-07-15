import { startOfDaySP } from "@/app/utils";
import { WeeklyFuellingSummaryModel } from "@/models/WeeklyFuellingSummary";
import { startOfWeek } from "date-fns";
import { isObjectIdOrHexString } from "mongoose";
import { parseWeeklySummaries, toWeeklySummaryDTO } from "./parse";
import type { WeeklyFuellingSummaryDTO } from "@/dto/WeeklyFuellingSummaryDTO";
import dbConnect from "@/lib/database/database";
import { calculateSummaryTotals } from "../utils";
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
      })
      .lean();

    if (!summary) return null;

    const parsedSummary = toWeeklySummaryDTO(summary as any);
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

    return parseWeeklySummaries(summaries);
  },

  async findById(id: string): Promise<WeeklyFuellingSummaryDTO | null> {
    await dbConnect();

    const summary = await WeeklyFuellingSummaryModel.findById(id)
      .populate({
        path: "departments.department",
        model: "Department",
      })
      .populate({
        path: "departments.vehicles.fuel",
        model: "Fuel",
      });

    return toWeeklySummaryDTO(summary as any);
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
    payload: Partial<WeeklyFuellingSummaryDTO>,
  ): Promise<WeeklyFuellingSummaryDTO | null> {
    await dbConnect();

    const weekStart = startOfWeek(startOfDaySP(new Date()), {
      weekStartsOn: 1,
    });
    const actualWeekSummary = await this.findByWeekStart();
    const fuels = await FuelRepository.findWithoutPagination!({});

    const fuelsIds = fuels.map((f) => f._id);
    const departmentsIds = (
      await DepartmentRepository.findWithoutPagination!({})
    ).map((d) => d._id.toString());

    const payloadFuelsIds = payload.departments?.flatMap((d) =>
      d.vehicles.flatMap((v) => v.fuel as string),
    );
    const payloadDepartmentsIds =
      payload.departments?.map((d) => d.department as string) ?? [];

    const areDepartmentsOk =
      payloadDepartmentsIds.every((d) => departmentsIds.includes(d)) ||
      payloadDepartmentsIds.length === 0;
    const areFuelsOk =
      payloadFuelsIds?.every((f) => fuelsIds.includes(f)) ||
      payloadFuelsIds?.length === 0;

    if (!payload._id && actualWeekSummary) {
      throw new Error("A summary for this week already exists.");
    }

    if (payload._id !== actualWeekSummary?._id) {
      throw new Error(
        "The summary id does not match the current week summary.",
      );
    }

    if (!areDepartmentsOk) {
      throw new Error("One or more departments in the payload do not exist.");
    }

    if (!areFuelsOk) {
      throw new Error("One or more fuels in the payload do not exist.");
    }

    const payloadWithUpdatedTotals = calculateSummaryTotals(payload, fuels);

    const summary = await WeeklyFuellingSummaryModel.findOneAndUpdate(
      { weekStart },
      {
        $set: payloadWithUpdatedTotals,
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        returnDocument: "after",
      },
    )
      .populate({
        path: "departments.department",
        model: "Department",
      })
      .populate({
        path: "departments.vehicles.fuel",
        model: "Fuel",
      })
      .lean();

    const parsedSummary = toWeeklySummaryDTO(summary as any);
    return parsedSummary;
  },
};
