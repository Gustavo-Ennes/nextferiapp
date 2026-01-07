import { WeeklyFuellingSummaryRepository } from "@/lib/repository/weeklyFuellingSummary/weeklyFuellingSummary";
import { WeeklyFuellingSummaryModel } from "@/models/WeeklyFuellingSummary";
import type { LocalStorageData } from "@/lib/repository/weeklyFuellingSummary/types";
import { startOfWeek, toDate } from "date-fns";
import { startOfDaySP } from "@/app/utils";
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

describe("WeeklyFuellingSummaryRepository.findById", () => {
  it("returns null when summary does not exist", async () => {
    const result = await WeeklyFuellingSummaryRepository.findByWeekStart();

    expect(result).toBeNull();
  });

  it("returns summary when it exists", async () => {
    const created = await WeeklyFuellingSummaryRepository.createOrUpdate(
      basePayload
    );

    const found = await WeeklyFuellingSummaryRepository.findByWeekStart();

    expect(found).not.toBeNull();
    expect(found?._id.toString()).toBe(created!._id.toString());
  });
});

describe("WeeklyFuellingSummaryRepository.createOrUpdate", () => {
  it("returns null if payload has no data", async () => {
    const result = await WeeklyFuellingSummaryRepository.createOrUpdate({
      data: [],
    } as any);

    expect(result).toBeNull();
  });

  it("creates a weekly summary when none exists", async () => {
    const created = await WeeklyFuellingSummaryRepository.createOrUpdate(
      basePayload
    );

    expect(created).toBeDefined();
    expect(created!.departments).toHaveLength(1);
    expect(created!.departments[0].name).toBe("saúde");
  });

  it("aggregates fuel totals and vehicle totals correctly", async () => {
    const created = await WeeklyFuellingSummaryRepository.createOrUpdate(
      basePayload
    );

    const dept = created!.departments[0];
    const vehicle = dept.vehicles[0];

    expect(dept.fuelTotals.gas).toBe(30);
    expect(vehicle.totalLiters).toBe(30);
    expect(vehicle.lastKm).toBe(1100);
  });

  it("sets weekStart to the start of the week (Monday)", async () => {
    const created = await WeeklyFuellingSummaryRepository.createOrUpdate(
      basePayload
    );

    const expectedWeekStart = startOfWeek(startOfDaySP(new Date()), {
      weekStartsOn: 1,
    });

    expect(toDate(created!.weekStart).getTime()).toBe(
      expectedWeekStart.getTime()
    );
  });

  it("updates an existing weekly summary instead of creating a new one", async () => {
    await WeeklyFuellingSummaryRepository.createOrUpdate(basePayload);

    const updatePayload = clone(basePayload);
    updatePayload.data[0].carEntries[0].fuelings.push({
      date: new Date(),
      quantity: 50,
      kmHr: 2000,
    });

    const updated = await WeeklyFuellingSummaryRepository.createOrUpdate(
      updatePayload
    );

    const count = await WeeklyFuellingSummaryModel.countDocuments();

    expect(count).toBe(1);
    expect(updated!.departments[0].fuelTotals.gas).toBe(
      sum(pluck("quantity", updatePayload.data[0].carEntries[0].fuelings))
    );
    expect(updated!.departments[0].vehicles[0].lastKm).toBe(2000);
  });

  it("should update if no id provided, but weekly summary already exists for this week", async () => {
    await WeeklyFuellingSummaryRepository.createOrUpdate(basePayload);
    const updatePayload = clone(basePayload);
    updatePayload.data[0].carEntries[0].fuelings.push({
      date: new Date(),
      quantity: 50,
      kmHr: 2000,
    });

    const supposedlyCreated =
      await WeeklyFuellingSummaryRepository.createOrUpdate(updatePayload);

    const count = await WeeklyFuellingSummaryModel.countDocuments();

    expect(count).toBe(1);
    expect(supposedlyCreated!.departments[0].fuelTotals.gas).toBe(
      sum(pluck("quantity", updatePayload.data[0].carEntries[0].fuelings))
    );
    expect(supposedlyCreated!.departments[0].vehicles[0].lastKm).toBe(2000);
  });

  it("does not allow two summaries with the same weekStart", async () => {
    const first = await WeeklyFuellingSummaryRepository.createOrUpdate(
      basePayload
    );

    const secondPayload = clone(basePayload);
    secondPayload.data[0].department = "educação";

    const second = await WeeklyFuellingSummaryRepository.createOrUpdate(
      secondPayload
    );

    const count = await WeeklyFuellingSummaryModel.countDocuments();

    expect(count).toBe(1);
    expect(second!._id.toString()).toBe(first!._id.toString());
    expect(second!.departments[0].name).toBe("educação");
  });

  it("does not create a new summary when called multiple times in the same week", async () => {
    await WeeklyFuellingSummaryRepository.createOrUpdate(basePayload);

    await WeeklyFuellingSummaryRepository.createOrUpdate(basePayload);

    await WeeklyFuellingSummaryRepository.createOrUpdate(basePayload);

    const count = await WeeklyFuellingSummaryModel.countDocuments();

    expect(count).toBe(1);
  });

  it("throws duplicate key error if trying to manually insert same weekStart", async () => {
    const weekStart = startOfWeek(startOfDaySP(new Date()), {
      weekStartsOn: 1,
    });

    await WeeklyFuellingSummaryModel.create({
      weekStart,
      departments: [],
    });

    await expect(
      WeeklyFuellingSummaryModel.create({
        weekStart,
        departments: [],
      })
    ).rejects.toThrow(/duplicate key/i);
  });
});

describe("WeeklyFuellingSummaryRepository.delete", () => {
  it("throws if delete receives invalid id", async () => {
    await expect(
      WeeklyFuellingSummaryRepository.delete("invalid-id" as any)
    ).rejects.toThrow(/Id not found/i);
  });

  it("deletes a weekly summary by id", async () => {
    const created = await WeeklyFuellingSummaryRepository.createOrUpdate(
      basePayload
    );

    await WeeklyFuellingSummaryRepository.delete(created!._id);

    const found = await WeeklyFuellingSummaryModel.findById(created!._id);

    expect(found).toBeNull();
  });

  it("deletes exactly one weekly summary", async () => {
    const created = await WeeklyFuellingSummaryRepository.createOrUpdate(
      basePayload
    );

    await WeeklyFuellingSummaryRepository.delete(created!._id);

    const count = await WeeklyFuellingSummaryModel.countDocuments();
    expect(count).toBe(0);
  });
});
