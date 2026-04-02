import { WeeklyFuellingSummaryRepository } from "@/lib/repository/weeklyFuellingSummary/weeklyFuellingSummary";
import { WeeklyFuellingSummaryModel } from "@/models/WeeklyFuellingSummary";
import type { LocalStorageData } from "@/lib/repository/weeklyFuellingSummary/types";
import { startOfWeek, toDate } from "date-fns";
import { startOfDaySP } from "@/app/utils";
import { clone, pluck, sum } from "ramda";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import { FuelPriceVersionRepository } from "@/lib/repository/fuelPriceVersion/fuelPriceVersion";
import { createBaseEntities } from "../vacation/utils";
import { Types } from "mongoose";
import DepartmentModel from "@/models/Department";
import type { BossDTO, DepartmentDTO } from "@/dto";

describe("WeeklyFuellingSummaryRepository", () => {
  let basePayload: LocalStorageData = {} as any;
  let boss: BossDTO;

  const beforeEachFn = async () => {
    const { baseDepartment, baseBoss } = await createBaseEntities();
    const fueling = await FuelRepository.create({
      name: "Gasolina",
      unit: "L",
    });

    boss = baseBoss;

    await FuelPriceVersionRepository.create({
      fuel: fueling._id,
      price: 5,
      version: 1,
    });

    basePayload = {
      pdfData: { items: [], opened: false },
      activeTab: 1,
      data: [
        {
          order: 1,
          department: baseDepartment._id,
          carEntries: [
            {
              vehicle: "Veículo #1",
              prefix: 123,
              fuel: fueling._id,
              fuelings: [
                {
                  date: new Date().toISOString(),
                  quantity: 30,
                  kmHr: 1100,
                },
              ],
            },
          ],
        },
      ],
    };
  };

  describe("WeeklyFuellingSummaryRepository.findById", () => {
    beforeEach(beforeEachFn);

    it("returns null when summary does not exist", async () => {
      const result = await WeeklyFuellingSummaryRepository.findByWeekStart();

      expect(result).toBeNull();
    });

    it("returns summary when it exists", async () => {
      const created =
        await WeeklyFuellingSummaryRepository.createOrUpdate(basePayload);

      const found = await WeeklyFuellingSummaryRepository.findByWeekStart();

      expect(found).not.toBeNull();
      expect(found?._id.toString()).toBe(created!._id.toString());
    });
  });

  describe("WeeklyFuellingSummaryRepository.createOrUpdate", () => {
    beforeEach(beforeEachFn);

    it("returns null if payload has no data", async () => {
      const result = await WeeklyFuellingSummaryRepository.createOrUpdate({
        data: [],
      } as any);

      expect(result).toBeNull();
    });

    it("creates a weekly summary when none exists", async () => {
      const created =
        await WeeklyFuellingSummaryRepository.createOrUpdate(basePayload);

      expect(created).toBeDefined();
      expect(created!.departments).toHaveLength(1);
      expect((created!.departments[0].department as DepartmentDTO)._id).toBe(
        basePayload.data[0].department,
      );
    });

    it("aggregates fuel totals and vehicle totals correctly", async () => {
      const created =
        await WeeklyFuellingSummaryRepository.createOrUpdate(basePayload);

      const dept = created!.departments[0];
      const vehicle = dept.vehicles[0];

      expect(vehicle.totalLiters).toBe(30);
      expect(vehicle.lastKm).toBe(1100);
    });

    it("sets weekStart to the start of the week (Monday)", async () => {
      const created =
        await WeeklyFuellingSummaryRepository.createOrUpdate(basePayload);

      const expectedWeekStart = startOfWeek(startOfDaySP(new Date()), {
        weekStartsOn: 1,
      });

      expect(toDate(created!.weekStart).getTime()).toBe(
        expectedWeekStart.getTime(),
      );
    });

    it("updates an existing weekly summary instead of creating a new one", async () => {
      await WeeklyFuellingSummaryRepository.createOrUpdate(basePayload);

      const updatePayload = clone(basePayload);
      updatePayload.data[0].carEntries[0].fuelings.push({
        date: new Date().toISOString(),
        quantity: 50,
        kmHr: 2000,
      });

      const updated =
        await WeeklyFuellingSummaryRepository.createOrUpdate(updatePayload);

      const count = await WeeklyFuellingSummaryModel.countDocuments();

      expect(count).toBe(1);
      expect(updated!.departments[0].vehicles[0].totalLiters).toBe(
        sum(pluck("quantity", updatePayload.data[0].carEntries[0].fuelings)),
      );
      expect(updated!.departments[0].vehicles[0].lastKm).toBe(2000);
    });

    it("should update if no id provided, but weekly summary already exists for this week", async () => {
      await WeeklyFuellingSummaryRepository.createOrUpdate(basePayload);
      const updatePayload = clone(basePayload);
      updatePayload.data[0].carEntries[0].fuelings.push({
        date: new Date().toISOString(),
        quantity: 50,
        kmHr: 2000,
      });

      const supposedlyCreated =
        await WeeklyFuellingSummaryRepository.createOrUpdate(updatePayload);

      const count = await WeeklyFuellingSummaryModel.countDocuments();

      expect(count).toBe(1);
      expect(supposedlyCreated!.departments[0].vehicles[0].totalLiters).toBe(
        sum(pluck("quantity", updatePayload.data[0].carEntries[0].fuelings)),
      );
      expect(supposedlyCreated!.departments[0].vehicles[0].lastKm).toBe(2000);
    });

    it("does not allow two summaries with the same weekStart", async () => {
      const first =
        await WeeklyFuellingSummaryRepository.createOrUpdate(basePayload);

      const secondDept = await DepartmentModel.create({
        name: "educação",
        responsible: boss._id,
        isActive: true,
      });

      const secondPayload = clone(basePayload);
      secondPayload.data[1] = {
        order: 2,
        department: secondDept._id.toString(),
        carEntries: [],
      };

      const second =
        await WeeklyFuellingSummaryRepository.createOrUpdate(secondPayload);

      const count = await WeeklyFuellingSummaryModel.countDocuments();

      expect(count).toBe(1);
      expect(second!._id.toString()).toBe(first!._id.toString());
      expect(second!.departments).toHaveLength(2); // Should have both departments
      expect(second!.departments.some((d) => d.name === "educação")).toBe(true);
    });

    it("does not create a new summary when called multiple times in the same week", async () => {
      await WeeklyFuellingSummaryRepository.createOrUpdate(basePayload);

      await WeeklyFuellingSummaryRepository.createOrUpdate(basePayload);

      await WeeklyFuellingSummaryRepository.createOrUpdate(basePayload);

      const count = await WeeklyFuellingSummaryModel.countDocuments();

      expect(count).toBe(1);
    });

    it("throws if fuel not found in database", async () => {
      const invalidFuelPayload = clone(basePayload);
      invalidFuelPayload.data[0].carEntries[0].fuel =
        new Types.ObjectId().toString(); // Invalid fuel id

      await expect(
        WeeklyFuellingSummaryRepository.createOrUpdate(invalidFuelPayload),
      ).rejects.toThrow(/Fuel .* not found in database/);
    });

    it("throws if department not found in database", async () => {
      const invalidDeptPayload = clone(basePayload);
      invalidDeptPayload.data[0].department = new Types.ObjectId().toString(); // Invalid department id

      await expect(
        WeeklyFuellingSummaryRepository.createOrUpdate(invalidDeptPayload),
      ).rejects.toThrow(/Department .* not found in database/);
    });
  });

  describe("WeeklyFuellingSummaryRepository.delete", () => {
    beforeEach(beforeEachFn);

    it("throws if delete receives id of non-existent summary", async () => {
      const fakeId = new Types.ObjectId().toString();

      await expect(
        WeeklyFuellingSummaryRepository.delete(fakeId),
      ).rejects.toThrow(/Summary not found/i);
    });

    it("deletes a weekly summary by id", async () => {
      const created =
        await WeeklyFuellingSummaryRepository.createOrUpdate(basePayload);

      await WeeklyFuellingSummaryRepository.delete(created!._id);

      const found = await WeeklyFuellingSummaryModel.findById(created!._id);

      expect(found).toBeNull();
    });

    it("deletes exactly one weekly summary", async () => {
      const created =
        await WeeklyFuellingSummaryRepository.createOrUpdate(basePayload);

      await WeeklyFuellingSummaryRepository.delete(created!._id);

      const count = await WeeklyFuellingSummaryModel.countDocuments();
      expect(count).toBe(0);
    });
  });
});
