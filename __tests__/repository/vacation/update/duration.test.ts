import { VacationRepository } from "@/lib/repository/vacation";
import type { Worker, Boss } from "@/app/types";
import type { VacationFormData } from "@/app/(secure)/vacation/types";
import { createBaseEntities } from "../utils";
import { addDays } from "date-fns";
import { endOfDaySP, endOfHalfDay } from "@/app/utils";

describe("VacationRepository.update.duration", () => {
  let worker: Worker;
  let boss: Boss;
  let basePayload: VacationFormData;

  beforeEach(async () => {
    const { baseWorker, baseBoss } = await createBaseEntities();
    worker = baseWorker;
    boss = baseBoss;

    basePayload = {
      duration: 30,
      type: "normal",
      period: "full",
      startDate: new Date().toISOString(),
      worker: worker._id.toString(),
      boss: boss._id.toString(),
      observation: "Test duration rules",
    };
  });

  const create = (data: VacationFormData) => VacationRepository.create(data);

  const update = (id: string, data: Partial<VacationFormData>) =>
    VacationRepository.update({ id, payload: data });

  describe("dayOff", () => {
    it("should allow duration = 1 when period = full", async () => {
      const created = await create({
        ...basePayload,
        type: "dayOff",
        duration: 1,
        period: "full",
      });

      const newStartDate = addDays(created.startDate, 2);
      const newEndDate = endOfDaySP(newStartDate);
      const updated = await update(created._id as string, {
        duration: 1,
        period: "full",
        startDate: newStartDate.toISOString(),
      });

      expect(updated.duration).toBe(1);
      expect(updated.period).toBe("full");
      expect(updated.startDate.getTime()).toBe(newStartDate.getTime());
      expect(updated.endDate.getTime()).toBe(newEndDate.getTime());
    });

    it("should allow duration = 0.5 when period = half", async () => {
      const created = await create({
        ...basePayload,
        type: "dayOff",
        duration: 0.5,
        period: "half",
      });

      const newStartDate = addDays(created.startDate, 2);
      const newEndDate = endOfHalfDay(newStartDate);
      const updated = await update(created._id as string, {
        duration: 0.5,
        period: "half",
        startDate: newStartDate.toISOString(),
      });

      expect(updated.duration).toBe(0.5);
      expect(updated.period).toBe("half");
      expect(updated.startDate.getTime()).toBe(newStartDate.getTime());
      expect(updated.endDate.getTime()).toBe(newEndDate.getTime());
    });

    it("should NOT allow duration = 1 with period = half", async () => {
      const created = await create({
        ...basePayload,
        type: "dayOff",
        duration: 1,
        period: "full",
      });

      await expect(
        update(created._id as string, {
          duration: 1,
          period: "half",
          startDate: addDays(created.startDate, 2).toISOString(),
        })
      ).rejects.toThrow("Period: 'half' means duration < 1");
    });

    it("should NOT allow duration = 0.5 with period = full", async () => {
      const created = await create({
        ...basePayload,
        type: "dayOff",
        duration: 1,
        period: "full",
      });

      await expect(
        update(created._id as string, {
          duration: 0.5,
          period: "full",
          startDate: addDays(created.startDate, 2).toISOString(),
        })
      ).rejects.toThrow("Period: 'full' means duration >= 1");
    });

    it("should NOT allow duration other than 0.5 or 1", async () => {
      const created = await create({
        ...basePayload,
        type: "dayOff",
        duration: 1,
        period: "full",
      });

      await expect(
        update(created._id as string, {
          duration: 2,
          startDate: addDays(created.startDate, 2).toISOString(),
        })
      ).rejects.toThrow("Duration: daysOff must have duration of [0.5, 1]");
    });
  });

  describe("normal", () => {
    it("should allow durations 15 and 30", async () => {
      const created = await create(basePayload);

      let updated = await update(created._id as string, { duration: 15 });
      expect(updated.duration).toBe(15);

      updated = await update(created._id as string, { duration: 30 });
      expect(updated.duration).toBe(30);
    });

    it("should NOT allow duration other than 15 or 30", async () => {
      const created = await create(basePayload);

      await expect(
        update(created._id as string, { duration: 45 })
      ).rejects.toThrow(
        "Duration: normal vacations must have duration of [15, 30]"
      );
    });

    it("should NOT allow period = half", async () => {
      const created = await create(basePayload);

      await expect(
        update(created._id as string, { period: "half" })
      ).rejects.toThrow("Period: 'half' means duration < 1");
    });
  });

  describe("license", () => {
    it("should allow any multiple of 15 between 15 and 90", async () => {
      const created = await create({
        ...basePayload,
        type: "license",
        duration: 15,
      });

      for (const d of [15, 30, 45, 60, 75, 90]) {
        const updated = await update(created._id as string, { duration: d });
        expect(updated.duration).toBe(d);
      }
    });

    it("should NOT allow durations > 90 or < 15", async () => {
      const created = await create({
        ...basePayload,
        type: "license",
        duration: 15,
      });

      await expect(
        update(created._id as string, { duration: 120 })
      ).rejects.toThrow(
        "Duration: licenses must have duration of [15, 30, 45, 60, 75, 90]"
      );

      await expect(
        update(created._id as string, { duration: 5 })
      ).rejects.toThrow(
        "Duration: licenses must have duration of [15, 30, 45, 60, 75, 90]"
      );
    });

    it("should NOT allow durations that are not multiples of 15", async () => {
      const created = await create({
        ...basePayload,
        type: "license",
        duration: 15,
      });

      await expect(
        update(created._id as string, { duration: 17 })
      ).rejects.toThrow(
        "Duration: licenses must have duration of [15, 30, 45, 60, 75, 90]"
      );
    });

    it("should NOT allow period = half", async () => {
      const created = await create({
        ...basePayload,
        type: "license",
        duration: 15,
      });

      await expect(
        update(created._id as string, { period: "half" })
      ).rejects.toThrow("Period: 'half' means duration < 1");
    });
  });
});
