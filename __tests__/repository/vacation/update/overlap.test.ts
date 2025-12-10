import { VacationRepository } from "@/lib/repository/vacation";
import { createBaseEntities } from "../utils";
import type { Worker, Boss } from "@/app/types";
import type { VacationFormData } from "@/app/(secure)/vacation/types";
import { addDays, subDays, addMilliseconds } from "date-fns";

describe("VacationRepository.update.overlap", () => {
  let worker: Worker;
  let boss: Boss;
  let basePayload: VacationFormData;

  const create = (data: VacationFormData) =>
    VacationRepository.create(data as any);

  const update = (id: string, payload: Partial<VacationFormData>) =>
    VacationRepository.update({ id, payload: payload });

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
      observation: "Obs",
    };
  });

  it("should NOT update if new.startDate falls inside another vacation", async () => {
    const baseStart = new Date();

    const v1 = await create({
      ...basePayload,
      duration: 15,
      startDate: baseStart.toISOString(),
    });

    const v2 = await create({
      ...basePayload,
      duration: 30,
      startDate: subDays(baseStart, 40).toISOString(),
    });

    const newStart = addDays(baseStart, 10);

    await expect(
      update(v2._id.toString(), { startDate: newStart.toISOString() })
    ).rejects.toThrow(`Conflicting vacations: [${v1._id.toString()}].`);
  });

  it("should NOT update if new.endDate falls inside another vacation", async () => {
    const baseStart = new Date();

    const blocker = await create({
      ...basePayload,
      duration: 30,
      startDate: baseStart.toISOString(),
    });

    const toUpdate = await create({
      ...basePayload,
      duration: 15,
      startDate: subDays(baseStart, 20).toISOString(),
    });

    await expect(
      update(toUpdate._id.toString(), { duration: 30 })
    ).rejects.toThrow(`Conflicting vacations: [${blocker._id.toString()}].`);
  });

  it("should NOT update if updated range fully wraps another vacation", async () => {
    const baseStart = new Date();

    const inner = await create({
      ...basePayload,
      startDate: baseStart.toISOString(),
      duration: 1,
      type: "dayOff",
    });

    const outer = await create({
      ...basePayload,
      startDate: subDays(baseStart, 20).toISOString(),
      duration: 15,
      type: "license",
    });

    await expect(
      update(outer._id.toString(), { duration: 60 })
    ).rejects.toThrow(`Conflicting vacations: [${inner._id.toString()}].`);
  });

  it("should NOT allow update to create dayOff inside a license", async () => {
    const start = new Date();

    const license = await create({
      ...basePayload,
      type: "license",
      duration: 90,
      startDate: start.toISOString(),
    });

    const dayOff = await create({
      ...basePayload,
      type: "dayOff",
      duration: 1,
      startDate: subDays(start, 2).toISOString(),
    });

    await expect(
      update(license._id.toString(), {
        startDate: subDays(start, 45).toISOString(),
      })
    ).rejects.toThrow(`Conflicting vacations: [${dayOff._id.toString()}].`);
  });

  it("should NOT update a license if expanded duration grows over other vacations", async () => {
    const start = new Date();

    const d1 = await create({
      ...basePayload,
      duration: 1,
      type: "dayOff",
      startDate: start.toISOString(),
    });

    const d2 = await create({
      ...basePayload,
      duration: 15,
      startDate: addDays(start, 15).toISOString(),
    });

    const license = await create({
      ...basePayload,
      type: "license",
      duration: 30,
      startDate: subDays(start, 35).toISOString(),
    });

    await expect(
      update(license._id.toString(), { duration: 90 })
    ).rejects.toThrow(
      `Conflicting vacations: [${d1._id.toString()}, ${d2._id.toString()}].`
    );
  });

  it("should allow update if new.startDate is exactly right after another endDate", async () => {
    const baseStart = new Date();

    const first = await create({
      ...basePayload,
      duration: 15,
      startDate: baseStart.toISOString(),
    });

    const second = await create({
      ...basePayload,
      startDate: addDays(baseStart, 40).toISOString(),
    });

    const nextValidStart = addMilliseconds(first.endDate, 1);

    const updated = await update(second._id.toString(), {
      startDate: nextValidStart.toISOString(),
    });

    expect(updated).toBeDefined();
  });

  it("should allow update if new.endDate is exactly the day before another starts", async () => {
    const baseStart = new Date();

    await create({
      ...basePayload,
      duration: 30,
      startDate: baseStart.toISOString(),
    });

    const v2 = await create({
      ...basePayload,
      startDate: addDays(baseStart, 60).toISOString(),
      duration: 15,
    });

    // ajustar v2 para terminar exatamente antes de v1 começar
    const newStart = subDays(baseStart, 16);

    const updated = await update(v2._id.toString(), {
      startDate: newStart.toISOString(),
      duration: 15,
    });

    expect(updated).toBeDefined();
  });

  it("should NOT allow update if new.startDate matches another startDate", async () => {
    const start = new Date();

    const v1 = await create({
      ...basePayload,
      startDate: start.toISOString(),
      duration: 15,
    });

    const v2 = await create({
      ...basePayload,
      startDate: addDays(start, 40).toISOString(),
      duration: 15,
    });

    await expect(
      update(v2._id.toString(), { startDate: start.toISOString() })
    ).rejects.toThrow(`Conflicting vacations: [${v1._id.toString()}].`);
  });
});
