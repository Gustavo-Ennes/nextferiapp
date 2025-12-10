import { VacationRepository } from "@/lib/repository/vacation";
import VacationModel from "@/models/Vacation";
import { addDays, differenceInDays, differenceInHours, toDate } from "date-fns";
import { endOfDaySP, endOfHalfDay, startOfDaySP } from "@/app/utils";
import { createBaseEntities } from "../utils";
import type { VacationFormData } from "@/app/(secure)/vacation/types";
import type { Boss, Vacation, Worker } from "@/app/types";

describe("VacationRepository.create.base", () => {
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

  it("should create a normal vacation", async () => {
    const expectedStartDate = startOfDaySP(toDate(basePayload.startDate));
    const expectedEndDate = endOfDaySP(
      addDays(expectedStartDate, basePayload.duration)
    );
    const createdVacation = await VacationRepository.create(basePayload as any);
    const daysDifference = differenceInDays(
      createdVacation.endDate,
      createdVacation.startDate
    );

    expect(createdVacation).toHaveProperty("_id");
    expect(createdVacation.type).toBe(basePayload.type);
    expect(createdVacation.duration).toBe(basePayload.duration);
    expect(daysDifference).toBe(basePayload.duration);
    expect(createdVacation.startDate.getTime()).toBe(
      expectedStartDate.getTime()
    );
    expect(createdVacation.endDate.getTime()).toBe(expectedEndDate.getTime());
    expect(createdVacation.period).toBe(basePayload.period);
    expect(createdVacation.cancelled).toBe(false);
    expect(createdVacation.worker).toHaveProperty("_id");
    expect(createdVacation.boss).toHaveProperty("_id");

    const savedDoc: Vacation | null = await VacationModel.findById(
      createdVacation._id
    );
    expect(savedDoc).not.toBeNull();
    expect(savedDoc?.worker._id).toStrictEqual(worker._id);
    expect(savedDoc?.boss._id).toStrictEqual(boss._id);
  });

  it("should create a half-day day off(duration < 1)", async () => {
    const dayOffPayload = {
      ...basePayload,
      duration: 0.5,
      period: "half",
      type: "dayOff",
    };
    const expectedStartDate = startOfDaySP(toDate(dayOffPayload.startDate));
    const expectedEndDate = endOfHalfDay(expectedStartDate);
    const createdVacation = await VacationRepository.create(
      dayOffPayload as any
    );
    const hoursDifference = differenceInHours(
      createdVacation.endDate,
      createdVacation.startDate
    );

    expect(createdVacation).toHaveProperty("_id");
    expect(createdVacation.type).toBe(dayOffPayload.type);
    expect(createdVacation.duration).toBe(dayOffPayload.duration);
    expect(hoursDifference).toBe(11);
    expect(createdVacation.startDate.getTime()).toBe(
      expectedStartDate.getTime()
    );
    expect(createdVacation.endDate.getTime()).toBe(expectedEndDate.getTime());
    expect(createdVacation.period).toBe(dayOffPayload.period);
    expect(createdVacation.cancelled).toBe(false);
    expect(createdVacation.worker).toHaveProperty("_id");
    expect(createdVacation.boss).toHaveProperty("_id");

    const savedDoc: Vacation | null = await VacationModel.findById(
      createdVacation._id
    );
    expect(savedDoc).not.toBeNull();
    expect(savedDoc?.worker._id).toStrictEqual(worker._id);
    expect(savedDoc?.boss._id).toStrictEqual(boss._id);
  });

  // should create a dayOff, a 15 vacation, 15 license, and another dayOff in sequence
  it("should create a dayOff, a 15-day vacation, a 15-day license, and another dayOff in sequence", async () => {
    const baseDate = new Date();

    const d1 = await VacationRepository.create({
      ...basePayload,
      type: "dayOff",
      duration: 1,
      period: "full",
      startDate: baseDate.toISOString(),
    } as any);

    const d2 = await VacationRepository.create({
      ...basePayload,
      type: "normal",
      duration: 15,
      period: "full",
      startDate: addDays(d1.endDate, 1).toISOString(),
    } as any);

    const d3 = await VacationRepository.create({
      ...basePayload,
      type: "license",
      duration: 15,
      period: "full",
      startDate: addDays(d2.endDate, 1).toISOString(),
    } as any);

    const d4 = await VacationRepository.create({
      ...basePayload,
      type: "dayOff",
      duration: 0.5,
      period: "half",
      startDate: addDays(d3.endDate, 1).toISOString(),
    } as any);

    expect(d1.type).toBe("dayOff");
    expect(d2.duration).toBe(15);
    expect(d3.type).toBe("license");
    expect(d4.type).toBe("dayOff");
  });
});
