import { FuelingWeeklySummaryRepository } from "@/lib/repository/weeklyFuellingSummary/weeklyFuellingSummary";
import { WeeklyFuellingSummaryModel } from "@/models/WeeklyFuellingSummary";
import type { LocalStorageData } from "@/lib/repository/weeklyFuellingSummary/types";
import { startOfWeek } from "date-fns";
import { startOfDaySP } from "@/app/utils";
import { Types } from "mongoose";
import { clone, pluck, sum } from "ramda";

const basePayload: LocalStorageData = {
  pdfData: {
    items: [],
    opened: false,
  },
  activeTab: 1,
  data: [
    {
      department: "saúde",
      order: 1,
      carEntries: [
        {
          vehicle: "ambulancia",
          prefix: 250,
          fuel: "gas",
          fuelings: [
            {
              date: new Date(),
              quantity: 20,
              kmHr: 1000,
            },
            {
              date: new Date(),
              quantity: 10,
              kmHr: 1100,
            },
          ],
        },
      ],
    },
  ],
};

describe("FuelingWeeklySummaryRepository.find", () => {
  it("returns null when summary does not exist", async () => {
    const result = await FuelingWeeklySummaryRepository.find(
      new Types.ObjectId().toString()
    );

    expect(result).toBeNull();
  });

  it("returns summary when it exists", async () => {
    const created = await FuelingWeeklySummaryRepository.createOrUpdate(
      basePayload
    );

    const found = await FuelingWeeklySummaryRepository.find(
      created!._id.toString()
    );

    expect(found).not.toBeNull();
    expect(found?._id.toString()).toBe(created!._id.toString());
  });
});

describe("FuelingWeeklySummaryRepository.createOrUpdate", () => {
  it("returns null if payload has no data", async () => {
    const result = await FuelingWeeklySummaryRepository.createOrUpdate({
      data: [],
    } as any);

    expect(result).toBeNull();
  });

  it("creates a weekly summary when none exists", async () => {
    const created = await FuelingWeeklySummaryRepository.createOrUpdate(
      basePayload
    );

    expect(created).toBeDefined();
    expect(created!.departments).toHaveLength(1);
    expect(created!.departments[0].name).toBe("saúde");
  });

  it("aggregates fuel totals and vehicle totals correctly", async () => {
    const created = await FuelingWeeklySummaryRepository.createOrUpdate(
      basePayload
    );

    const dept = created!.departments[0];
    const vehicle = dept.vehicles[0];

    expect(dept.fuelTotals.gas).toBe(30);
    expect(vehicle.totalLiters).toBe(30);
    expect(vehicle.lastKm).toBe(1100);
  });

  it("sets weekStart to the start of the week (Monday)", async () => {
    const created = await FuelingWeeklySummaryRepository.createOrUpdate(
      basePayload
    );

    const expectedWeekStart = startOfWeek(startOfDaySP(new Date()), {
      weekStartsOn: 1,
    });

    expect(created!.weekStart.getTime()).toBe(expectedWeekStart.getTime());
  });

  it("updates an existing weekly summary instead of creating a new one", async () => {
    const created = await FuelingWeeklySummaryRepository.createOrUpdate(
      basePayload
    );

    const updatePayload = clone(basePayload);
    updatePayload.data[0].carEntries[0].fuelings.push({
      date: new Date(),
      quantity: 50,
      kmHr: 2000,
    });

    const updated = await FuelingWeeklySummaryRepository.createOrUpdate(
      updatePayload,
      created!._id.toString()
    );

    const count = await WeeklyFuellingSummaryModel.countDocuments();

    expect(count).toBe(1);
    expect(updated!.departments[0].fuelTotals.gas).toBe(
      sum(pluck("quantity", updatePayload.data[0].carEntries[0].fuelings))
    );
    expect(updated!.departments[0].vehicles[0].lastKm).toBe(2000);
  });

  it("should update if no id provided, but weekly summary already exists for this week", async () => {
    await FuelingWeeklySummaryRepository.createOrUpdate(basePayload);
    const updatePayload = clone(basePayload);
    updatePayload.data[0].carEntries[0].fuelings.push({
      date: new Date(),
      quantity: 50,
      kmHr: 2000,
    });

    const supposedlyCreated =
      await FuelingWeeklySummaryRepository.createOrUpdate(updatePayload);

    const count = await WeeklyFuellingSummaryModel.countDocuments();

    expect(count).toBe(1);
    expect(supposedlyCreated!.departments[0].fuelTotals.gas).toBe(
      sum(pluck("quantity", updatePayload.data[0].carEntries[0].fuelings))
    );
    expect(supposedlyCreated!.departments[0].vehicles[0].lastKm).toBe(2000);
  });

  it("should THROW an error if id provided, but summary not found", async () => {
    await FuelingWeeklySummaryRepository.createOrUpdate(basePayload);
    const updatePayload = clone(basePayload);
    updatePayload.data[0].carEntries[0].fuelings.push({
      date: new Date(),
      quantity: 50,
      kmHr: 2000,
    });

    await expect(
      FuelingWeeklySummaryRepository.createOrUpdate(
        updatePayload,
        new Types.ObjectId().toString()
      )
    ).rejects.toThrow(`Fuelling weekly summary not found.`);
  });
});

describe("FuelingWeeklySummaryRepository.delete", () => {
  it("throws if delete receives invalid id", async () => {
    await expect(
      FuelingWeeklySummaryRepository.delete("invalid-id" as any)
    ).rejects.toThrow(/Id not found/i);
  });

  it("deletes a weekly summary by id", async () => {
    const created = await FuelingWeeklySummaryRepository.createOrUpdate(
      basePayload
    );

    await FuelingWeeklySummaryRepository.delete(created!._id);

    const found = await WeeklyFuellingSummaryModel.findById(created!._id);

    expect(found).toBeNull();
  });
});
