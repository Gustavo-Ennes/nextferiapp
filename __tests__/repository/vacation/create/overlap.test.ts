import { VacationRepository } from "@/lib/repository/vacation";
import type { Worker, Boss } from "@/app/types";
import { createBaseEntities } from "../utils";
import type { VacationFormData } from "@/app/(secure)/vacation/types";
import { addDays, addMilliseconds, subDays } from "date-fns";

describe("VacationRepository.create.overlap", () => {
  let worker: Worker;
  let boss: Boss;
  let basePayload: VacationFormData;

  beforeEach(async () => {
    const { baseWorker, baseBoss } = await createBaseEntities();
    boss = baseBoss;
    worker = baseWorker;

    basePayload = {
      duration: 30,
      type: "normal",
      period: "full",
      startDate: new Date().toISOString(),
      worker: worker._id.toString(),
      boss: boss._id.toString(),
      observation: "Férias normais",
    };
  });

  const create = (data: VacationFormData) =>
    VacationRepository.create(data as any);

  it("should NOT create vacation if new.startDate is inside an existing vacation", async () => {
    const baseStart = new Date();

    const existing = await create({
      ...basePayload,
      duration: 15,
      startDate: baseStart.toISOString(),
    });

    const newStart = addDays(baseStart, 12);

    await expect(
      create({
        ...basePayload,
        type: "license",
        duration: 15,
        period: "full",
        startDate: newStart.toISOString(),
      })
    ).rejects.toThrow(`Conflicting vacations: [${existing._id.toString()}].`);
  });

  it("should NOT create vacation if new.endDate is inside an existing vacation", async () => {
    const baseStart = new Date();

    const existing = await create({
      ...basePayload,
      duration: 30,
      startDate: baseStart.toISOString(),
    });

    const newStart = subDays(baseStart, 20); //starts 20 days before
    const duration = 30; // but has 30 days duration(overlap endDate)

    await expect(
      create({
        ...basePayload,
        startDate: newStart.toISOString(),
        duration,
      })
    ).rejects.toThrow(`Conflicting vacations: [${existing._id.toString()}].`);
  });

  it("should NOT create vacation if new covers an entire existing vacation", async () => {
    const baseStart = new Date();

    const existing = await create({
      ...basePayload,
      duration: 1,
      startDate: baseStart.toISOString(),
      period: "full",
      type: "dayOff",
    });

    const newStart = subDays(baseStart, 15); //starts 20 days before
    const duration = 30; // but has 30 days duration(overlap endDate)

    await expect(
      create({
        ...basePayload,
        duration,
        startDate: newStart.toISOString(),
      })
    ).rejects.toThrow(`Conflicting vacations: [${existing._id.toString()}].`);
  });

  it("should NOT create a dayOff in the middle of a 90-day license", async () => {
    const licenseStart = new Date();

    const existing = await create({
      ...basePayload,
      type: "license",
      duration: 90,
      startDate: licenseStart.toISOString(),
    });

    const newStart = addDays(licenseStart, existing.duration / 2);

    await expect(
      create({
        ...basePayload,
        type: "dayOff",
        duration: 1,
        period: "full",
        startDate: newStart.toISOString(),
      })
    ).rejects.toThrow(`Conflicting vacations: [${existing._id.toString()}].`);
  });

  it("should NOT create 90-day license that engulfs dayOff/15 normal vacations", async () => {
    const baseStart = new Date();

    const small1 = await create({
      ...basePayload,
      duration: 1,
      type: "dayOff",
      startDate: baseStart.toISOString(),
    });

    const small2Start = addDays(baseStart, 15);

    const small2 = await create({
      ...basePayload,
      duration: 15,
      type: "normal",
      startDate: small2Start.toISOString(),
    });

    const newStart = subDays(small1.startDate, 30);

    await expect(
      create({
        ...basePayload,
        type: "license",
        duration: 90,
        startDate: newStart.toISOString(),
      })
    ).rejects.toThrow(
      `Conflicting vacations: [${small1._id.toString()}, ${small2._id.toString()}].`
    );
  });

  it("should allow creation if new startDate is exactly the day after previous endDate", async () => {
    const baseStart = new Date();

    const existing = await create({
      ...basePayload,
      duration: 15,
      startDate: baseStart.toISOString(),
    });

    const nextDay = addMilliseconds(existing.endDate, 1);

    const created = await create({
      ...basePayload,
      startDate: nextDay.toISOString(),
    });

    expect(created).toBeDefined();
  });

  it("should allow creation if new endDate is exactly the day before existing startDate", async () => {
    const baseStart = new Date();

    await create({
      ...basePayload,
      duration: 30,
      startDate: baseStart.toISOString(),
    });

    const newDuration = 15;
    const newStart = subDays(baseStart, newDuration + 1);

    const created = await create({
      ...basePayload,
      startDate: newStart.toISOString(),
      duration: newDuration,
    });

    expect(created).toBeDefined();
  });

  it("should NOT create vacation if startDate equals another startDate", async () => {
    const start = new Date();

    const existing = await create({
      ...basePayload,
      startDate: start.toISOString(),
      duration: 15,
    });

    await expect(
      create({
        ...basePayload,
        startDate: start.toISOString(),
        duration: 1,
        type: "dayOff",
      })
    ).rejects.toThrow(`Conflicting vacations: [${existing._id.toString()}].`);
  });

  it("should NOT create vacation if new period starts inside and ends after existing", async () => {
    const baseStart = new Date();

    const existing = await create({
      ...basePayload,
      startDate: baseStart.toISOString(),
      duration: 30,
    });

    const newStart = addDays(baseStart, existing.duration / 2);

    await expect(
      create({
        ...basePayload,
        startDate: newStart.toISOString(),
        type: "license",
        duration: 90,
      })
    ).rejects.toThrow(`Conflicting vacations: [${existing._id.toString()}].`);
  });
});
