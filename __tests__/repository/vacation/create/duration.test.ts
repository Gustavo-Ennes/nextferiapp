import { VacationRepository } from "@/lib/repository/vacation";
import type { Worker, Boss } from "@/app/types";
import { createBaseEntities } from "../utils";
import type { VacationFormData } from "@/app/(secure)/vacation/types";

describe("VacationRepository.create.duration", () => {
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

  it("should NOT create a dayOff if duration > 1", async () => {
    const invalidPayload = {
      ...basePayload,
      duration: 2,
      period: "half",
      type: "dayOff",
    };

    await expect(
      VacationRepository.create(invalidPayload as any)
    ).rejects.toThrow("Duration: daysOff must have duration of [0.5, 1]");
  });

  it("should NOT create a half-day vacation if duration >= 1", async () => {
    const invalidPayload = {
      ...basePayload,
      duration: 1,
      period: "half",
      type: "dayOff",
    };

    await expect(
      VacationRepository.create(invalidPayload as any)
    ).rejects.toThrow("Period: 'half' means duration < 1");
  });

  it("should NOT create a full-day vacation if duration < 1", async () => {
    const invalidPayload = {
      ...basePayload,
      duration: 0.5,
      period: "full",
      type: "dayOff",
    };

    await expect(
      VacationRepository.create(invalidPayload as any)
    ).rejects.toThrow("Period: 'full' means duration >= 1");
  });

  it("should NOT create a normal vacation if duration is not 15 or 30 days", async () => {
    const invalidPayload = {
      ...basePayload,
      duration: 90,
      type: "normal",
      period: "full",
    };

    await expect(
      VacationRepository.create(invalidPayload as any)
    ).rejects.toThrow(
      "Duration: normal vacations must have duration of [15, 30]"
    );
  });

  it("should NOT create a license vacation if duration isn't a valid multiple of 15", async () => {
    const invalidPayload = {
      ...basePayload,
      duration: 22, // different
      type: "license",
      period: "full",
    };

    await expect(
      VacationRepository.create(invalidPayload as any)
    ).rejects.toThrow(
      "Duration: licenses must have duration of [15, 30, 45, 60, 75, 90]"
    );
  });
});
