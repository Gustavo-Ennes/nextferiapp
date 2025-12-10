import { VacationRepository } from "@/lib/repository/vacation";
import type { Worker, Boss } from "@/app/types";
import { Types } from "mongoose";
import { createBaseEntities } from "../utils";

describe("VacationRepository.update.missing", () => {
  let worker: Worker;
  let boss: Boss;
  let vacationId: string;

  beforeEach(async () => {
    const { baseWorker, baseBoss } = await createBaseEntities();
    worker = baseWorker;
    boss = baseBoss;

    const created = await VacationRepository.create({
      duration: 30,
      type: "normal",
      period: "full",
      startDate: new Date().toISOString(),
      worker: worker._id.toString(),
      boss: boss._id.toString(),
      observation: "original",
    } as any);

    vacationId = created._id.toString();
  });

  it("should NOT update if _id is missing", async () => {
    await expect(
      VacationRepository.update({
        id: undefined as any,
        payload: { observation: "test" },
      })
    ).rejects.toThrow("Id prop needs to be a valid ObjectId.");
  });

  it("should NOT update if _id is invalid", async () => {
    await expect(
      VacationRepository.update({
        id: "invalid-id",
        payload: { observation: "test" },
      })
    ).rejects.toThrow("Id prop needs to be a valid ObjectId.");
  });

  it("should NOT update if vacation does NOT exist", async () => {
    const fakeId = new Types.ObjectId().toString();

    await expect(
      VacationRepository.update({
        id: fakeId,
        payload: { observation: "test" },
      })
    ).rejects.toThrow("Vacation doesn't exists.");
  });

  it("should NOT update if payload is missing", async () => {
    await expect(
      VacationRepository.update({
        id: vacationId,
        payload: undefined as any,
      })
    ).rejects.toThrow("Invalid input: expected object, received undefined");
  });

  it("should NOT update if type is explicitly invalid", async () => {
    await expect(
      VacationRepository.update({
        id: vacationId,
        payload: { type: "superVacation" as any },
      })
    ).rejects.toThrow(
      'Invalid option: expected one of "dayOff"|"normal"|"license"'
    );
  });

  it("should NOT update if period is invalid", async () => {
    await expect(
      VacationRepository.update({
        id: vacationId,
        payload: { period: "quarter" as any },
      })
    ).rejects.toThrow('Invalid option: expected one of "half"|"full"');
  });

  it("should NOT update if startDate is invalid", async () => {
    await expect(
      VacationRepository.update({
        id: vacationId,
        payload: { startDate: "not-a-date" as any },
      })
    ).rejects.toThrow('StartDate is invalid.');
  });

  it("should NOT update if duration is NaN", async () => {
    await expect(
      VacationRepository.update({
        id: vacationId,
        payload: { duration: NaN as any },
      })
    ).rejects.toThrow("Invalid input: expected number, received NaN");
  });

  it("should NOT update if duration is negative", async () => {
    await expect(
      VacationRepository.update({
        id: vacationId,
        payload: { duration: -5 },
      })
    ).rejects.toThrow('Duration should be a positive number');
  });

  it("should NOT update if duration is zero", async () => {
    await expect(
      VacationRepository.update({
        id: vacationId,
        payload: { duration: 0 },
      })
    ).rejects.toThrow('Duration should be a positive number');
  });

  it("should NOT update if worker is invalid ObjectId", async () => {
    await expect(
      VacationRepository.update({
        id: vacationId,
        payload: { worker: "invalid" as any },
      })
    ).rejects.toThrow("Invalid id for worker");
  });

  it("should NOT update if boss is invalid ObjectId", async () => {
    await expect(
      VacationRepository.update({
        id: vacationId,
        payload: { boss: "abc123" as any },
      })
    ).rejects.toThrow('Invalid id for boss');
  });

  it("should NOT update if worker does NOT exist", async () => {
    const fakeWorker = new Types.ObjectId().toString();

    await expect(
      VacationRepository.update({
        id: vacationId,
        payload: { worker: fakeWorker },
      })
    ).rejects.toThrow(/worker/i);
  });

  it("should NOT update if boss does NOT exist", async () => {
    const fakeBoss = new Types.ObjectId().toString();

    await expect(
      VacationRepository.update({
        id: vacationId,
        payload: { boss: fakeBoss },
      })
    ).rejects.toThrow(/boss/i);
  });
});
