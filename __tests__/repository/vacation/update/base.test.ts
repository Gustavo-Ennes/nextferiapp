import { VacationRepository } from "@/lib/repository/vacation";
import VacationModel from "@/models/Vacation";
import { addDays, toDate, differenceInDays, differenceInHours } from "date-fns";
import { startOfDaySP, endOfDaySP, endOfHalfDay } from "@/app/utils";
import type { Worker, Boss } from "@/app/types";
import { createBaseEntities } from "../utils";
import type { VacationFormData } from "@/app/(secure)/vacation/types";

describe("VacationRepository.update.base", () => {
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
      observation: "Férias normais",
    };
  });

  const create = (data: VacationFormData) => VacationRepository.create(data);

  const update = (id: string, data: Partial<VacationFormData>) =>
    VacationRepository.update({ id, payload: data });

  it("should update only observation", async () => {
    const created = await create(basePayload);

    const updated = await update(created._id as string, {
      observation: "Updated observation",
    });

    expect(updated.observation).toBe("Updated observation");
    expect(updated).toHaveProperty("_id", created._id);
    expect(updated.type).toBe(created.type);
    expect(updated.duration).toBe(created.duration);
    expect(updated.startDate.getTime()).toBe(created.startDate.getTime());
    expect(updated.endDate.getTime()).toBe(created.endDate.getTime());
    expect(updated.period).toBe(created.period);
    expect(updated.cancelled).toBe(created.cancelled);
    expect(updated.worker).toHaveProperty("_id", created.worker);
    expect(updated.boss).toHaveProperty("_id", created.boss);
    expect(updated.observation).not.toBe(created.observation);

    const doc = await VacationModel.findById(created._id);
    expect(doc?.observation).toBe("Updated observation");
  });

  it("should update startDate and recalculate endDate correctly (normal vacation)", async () => {
    const created = await create(basePayload);
    const newStart = addDays(new Date(), 10);
    const expectedStart = startOfDaySP(newStart);
    const expectedEnd = endOfDaySP(
      addDays(expectedStart, basePayload.duration - 1)
    );

    const updated = await update(created._id as string, {
      startDate: newStart.toISOString(),
    });

    expect(updated.startDate.getTime()).toBe(expectedStart.getTime());
    expect(updated.endDate.getTime()).toBe(expectedEnd.getTime());

    const doc = await VacationModel.findById(created._id);
    expect(doc?.startDate.getTime()).toBe(expectedStart.getTime());
    expect(doc?.endDate.getTime()).toBe(expectedEnd.getTime());
  });

  it("should update duration and recalculate endDate", async () => {
    const created = await create(basePayload);

    const newDuration = 15;

    const expectedStart = startOfDaySP(toDate(basePayload.startDate));
    const expectedEnd = endOfDaySP(addDays(expectedStart, newDuration - 1));

    const updated = await update(created._id as string, {
      duration: newDuration,
    });

    const daysDiff = differenceInDays(updated.endDate, updated.startDate);

    expect(daysDiff).toBe(newDuration - 1);
    expect(updated.endDate.getTime()).toBe(expectedEnd.getTime());

    const doc = await VacationModel.findById(created._id);
    expect(doc?.duration).toBe(newDuration);
  });

  it("should update to half-day dayOff and recalc endDate", async () => {
    const created = await create({
      ...basePayload,
      duration: 1,
      type: "dayOff",
      period: "full",
    });

    const updated = await update(created._id as string, {
      duration: 0.5,
      period: "half",
    });

    const expectedStart = startOfDaySP(created.startDate);
    const expectedEnd = endOfHalfDay(expectedStart);

    const hoursDiff = differenceInHours(updated.endDate, updated.startDate);

    expect(hoursDiff).toBe(11);
    expect(updated.endDate.getTime()).toBe(expectedEnd.getTime());

    const doc = await VacationModel.findById(created._id);
    expect(doc?.period).toBe("half");
    expect(doc?.duration).toBe(0.5);
  });

  it("should update startDate and duration together", async () => {
    const created = await create({
      ...basePayload,
      type: "license",
      duration: 90,
    });

    const newStart = addDays(new Date(), 5);
    const newDuration = 60;

    const expectedStart = startOfDaySP(newStart);
    const expectedEnd = endOfDaySP(addDays(expectedStart, newDuration - 1));

    const updated = await update(created._id as string, {
      startDate: newStart.toISOString(),
      duration: newDuration,
    });

    expect(updated.startDate.getTime()).toBe(expectedStart.getTime());
    expect(updated.endDate.getTime()).toBe(expectedEnd.getTime());

    const doc = await VacationModel.findById(created._id);
    expect(doc?.startDate.getTime()).toBe(expectedStart.getTime());
    expect(doc?.endDate.getTime()).toBe(expectedEnd.getTime());
    expect(doc?.duration).toBe(newDuration);
  });
});
