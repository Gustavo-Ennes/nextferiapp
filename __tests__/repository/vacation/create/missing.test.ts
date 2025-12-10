import { VacationRepository } from "@/lib/repository/vacation";
import type { Worker, Boss } from "@/app/types";
import { Types } from "mongoose";
import { createBaseEntities } from "../utils";
import type { VacationFormData } from "@/app/(secure)/vacation/types";

describe("VacationRepository.create.missing", () => {
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

  it("should NOT create if no type", async () => {
    const payload = { ...basePayload, type: undefined as any };

    await expect(VacationRepository.create(payload as any)).rejects.toThrow(
      /type/i
    );
  });

  it("should NOT create if unknown type", async () => {
    const payload = { ...basePayload, type: "twoDayOff" as any };

    await expect(VacationRepository.create(payload as any)).rejects.toThrow(
      /type/i
    );
  });

  it("should NOT create if unknown period", async () => {
    const payload = { ...basePayload, period: "middle" as any };

    await expect(VacationRepository.create(payload as any)).rejects.toThrow(
      /period/i
    );
  });

  it("should NOT create if no startDate", async () => {
    const payload = { ...basePayload, startDate: undefined as any };

    await expect(VacationRepository.create(payload as any)).rejects.toThrow(
      /startDate/i
    );
  });

  it("should NOT create if no worker", async () => {
    const payload = { ...basePayload, worker: undefined as any };

    await expect(VacationRepository.create(payload as any)).rejects.toThrow(
      "Invalid input: expected string, received undefined"
    );
  });

  it("should NOT create if worker does NOT exist", async () => {
    const nonExistentId = new Types.ObjectId().toString();

    const payload = { ...basePayload, worker: nonExistentId };

    await expect(VacationRepository.create(payload as any)).rejects.toThrow(
      /worker/i
    );
  });

  it("should NOT create if no boss", async () => {
    const payload = { ...basePayload, boss: undefined as any };

    await expect(VacationRepository.create(payload as any)).rejects.toThrow(
      "Invalid input: expected string, received undefined"
    );
  });

  it("should NOT create if boss does NOT exist", async () => {
    const nonExistentBoss = new Types.ObjectId().toString();

    const payload = { ...basePayload, boss: nonExistentBoss };

    await expect(VacationRepository.create(payload as any)).rejects.toThrow(
      /boss/i
    );
  });
});
