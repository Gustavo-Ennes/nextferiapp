import { VacationRepository } from "@/lib/repository/vacation";
import { createBaseEntities } from "./utils";
import type { Worker, Boss } from "@/app/types";
import { Types } from "mongoose";

describe("VacationRepository.delete", () => {
  let worker: Worker;
  let boss: Boss;
  let baseVacation: any;

  const createVacation = (override = {}) =>
    VacationRepository.create({
      duration: 15,
      type: "normal",
      period: "full",
      startDate: new Date().toISOString(),
      worker: worker._id.toString(),
      boss: boss._id.toString(),
      observation: "Initial obs",
      ...override,
    });

  beforeEach(async () => {
    const { baseWorker, baseBoss } = await createBaseEntities();
    worker = baseWorker;
    boss = baseBoss;

    baseVacation = await createVacation();
  });

  it("should cancel a vacation by setting cancelled: true", async () => {
    const updated = await VacationRepository.delete(
      baseVacation._id.toString()
    );

    expect(updated.cancelled).toBe(true);
  });

  it("should update only cancelled", async () => {
    const updated = await VacationRepository.delete(
      baseVacation._id.toString()
    );

    expect(updated.cancelled).toBe(true);

    // ensure nothing changed
    expect(updated.observation).toBe(baseVacation.observation);
    expect(updated.duration).toBe(baseVacation.duration);
    expect(updated.type).toBe(baseVacation.type);
    expect(updated.period).toBe(baseVacation.period);
    expect(updated.worker.toString()).toBe(baseVacation.worker.toString());
    expect(updated.boss.toString()).toBe(baseVacation.boss.toString());
    expect(new Date(updated.startDate).getTime()).toBe(
      new Date(baseVacation.startDate).getTime()
    );
  });

  it("should NOT overwrite observation if not provided", async () => {
    const updated = await VacationRepository.delete(
      baseVacation._id.toString()
    );

    expect(updated.observation).toBe(baseVacation.observation);
  });

  it("should throw if vacation does NOT exist", async () => {
    const nonExistentId = new Types.ObjectId().toString();

    await expect(VacationRepository.delete(nonExistentId)).rejects.toThrow(
      "Vacation doesn't exists."
    );
  });

  it("should return the updated vacation document", async () => {
    const updated = await VacationRepository.delete(
      baseVacation._id.toString()
    );

    expect(updated).toBeDefined();
    expect(updated._id.toString()).toBe(baseVacation._id.toString());
  });
});
