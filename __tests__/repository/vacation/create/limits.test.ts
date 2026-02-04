import { VacationRepository } from "@/lib/repository/vacation/vacation";
import { createBaseEntities } from "../utils";
import type { VacationFormData } from "@/app/(secure)/vacation/types";
import { setDate, toDate } from "date-fns";
import type { BossDTO, WorkerDTO } from "@/dto";

describe("VacationRepository.create.limits", () => {
  let worker: WorkerDTO;
  let boss: BossDTO;
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
      worker: (worker as WorkerDTO)._id,
      boss: boss._id.toString(),
      observation: "Férias normais",
    };
  });

  it("should NOT create a dayOff in the same month for the same worker", async () => {
    const today = new Date();

    await VacationRepository.create({
      ...basePayload,
      type: "dayOff",
      period: "full",
      duration: 1,
      startDate: today.toISOString(),
      worker: worker._id,
      boss: boss._id,
    });

    const invalidPayload = {
      ...basePayload,
      type: "dayOff",
      duration: 0.5,
      period: "half",
      startDate: setDate(today, 27).toISOString(),
    };

    await expect(
      VacationRepository.create(invalidPayload as any)
    ).rejects.toThrow("Worker exceeds his monthly dayOff limits (1).");
  });

  // shouldn't create if type is 'dayOff' and worker exceeds early dayOffs(6 days in period=full)
  it("should NOT create a dayOff if worker already used 6 full dayOffs in the same year", async () => {
    const year = new Date().getFullYear();

    // cria 6 dayOffs no mesmo ano
    for (let i = 0; i < 6; i++) {
      await VacationRepository.create({
        ...basePayload,
        type: "dayOff",
        period: "full",
        duration: 1,
        startDate: new Date(year, i + 1, 1).toISOString(),
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

  it("should create a dayOff if worker has 6 daysOff,but some are half-period", async () => {
    const year = new Date().getFullYear();

    // cria 6 dayOffs no mesmo ano
    for (let i = 0; i < 6; i++) {
      await VacationRepository.create({
        ...basePayload,
        type: "dayOff",
        period: "half",
        duration: 0.5,
        startDate: new Date(year, i + 1, 1).toISOString(),
        worker: worker._id,
        boss: boss._id,
      });
    }

    const testPayload = {
      ...basePayload,
      type: "dayOff",
      duration: 1,
      period: "full",
      startDate: new Date(year, 6, 15).toISOString(),
    };

    const created = await VacationRepository.create(testPayload as any);

    expect(created.type).toBe("dayOff");
    expect(created.duration).toBe(1);
    expect(toDate(created.startDate).getFullYear()).toBe(year);
  });

  // should create dayOff for next year if this year is exceeded but next doesn't
  it("should create a dayOff for next year if current year is full but next year is available", async () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    // enche o ano atual
    for (let i = 0; i < 6; i++) {
      await VacationRepository.create({
        ...basePayload,
        type: "dayOff",
        period: "half",
        duration: 0.5,
        startDate: new Date(currentYear, i + 1, 1).toISOString(),
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
    expect(toDate(created.startDate).getFullYear()).toBe(nextYear);
  });
});
