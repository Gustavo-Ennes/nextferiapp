import { VacationRepository } from "@/lib/repository/vacation";
import type { Worker, Boss } from "@/app/types";
import { createBaseEntities } from "../utils";
import VacationModel from "@/models/Vacation";
import type { VacationFormData } from "@/app/(secure)/vacation/types";

describe("VacationRepository.create.limits", () => {
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

  // shouldn't create if type is 'dayOff' and worker exceeds early dayOffs(6)
  it("should NOT create a dayOff if worker already used 6 dayOffs in the same year", async () => {
    const year = new Date().getFullYear();

    // cria 6 dayOffs no mesmo ano
    for (let i = 0; i < 6; i++) {
      await VacationModel.create({
        ...basePayload,
        type: "dayOff",
        period: "half",
        duration: 0.5,
        startDate: new Date(year, 0, i + 1),
        worker: worker._id,
        boss: boss._id,
      });
    }

    // 7º deve falhar
    const invalidPayload = {
      ...basePayload,
      type: "dayOff",
      duration: 0.5,
      period: "half",
      startDate: new Date(year, 5, 10).toISOString(),
    };

    await expect(
      VacationRepository.create(invalidPayload as any)
    ).rejects.toThrow("Worker exceeds his annual dayOff limits (6).");
  });
  // should create dayOff for next year if this year is exceeded but next doesn't
  it("should create a dayOff for next year if current year is full but next year is available", async () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    // enche o ano atual
    for (let i = 0; i < 6; i++) {
      await VacationModel.create({
        ...basePayload,
        type: "dayOff",
        period: "half",
        duration: 0.5,
        startDate: new Date(currentYear, 0, i + 1),
        worker: worker._id,
        boss: boss._id,
      });
    }

    const testPayload = {
      ...basePayload,
      type: "dayOff",
      duration: 0.5,
      period: "half",
      startDate: new Date(nextYear, 6, 15).toISOString(),
    };

    const created = await VacationRepository.create(testPayload as any);

    expect(created.type).toBe("dayOff");
    expect(created.duration).toBe(0.5);
    expect(created.startDate.getFullYear()).toBe(nextYear);
  });
});
