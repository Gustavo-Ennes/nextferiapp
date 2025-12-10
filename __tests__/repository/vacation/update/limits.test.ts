import { VacationRepository } from "@/lib/repository/vacation";
import type { Worker, Boss } from "@/app/types";
import { createBaseEntities } from "../utils";
import VacationModel from "@/models/Vacation";
import type { VacationFormData } from "@/app/(secure)/vacation/types";
import { set } from "date-fns";

describe("VacationRepository.update.limits", () => {
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

  const createDayOff = (year: number, day: number, cancelled = false) =>
    VacationModel.create({
      ...basePayload,
      type: "dayOff",
      duration: 0.5,
      period: "half",
      startDate: new Date(year, 0, day),
      worker: worker._id,
      boss: boss._id,
      cancelled,
    });

  it("should NOT update type to dayOff if worker already used 6 dayOffs in the same year", async () => {
    const year = new Date().getFullYear();

    // cria 6 dayOffs válidos
    for (let i = 0; i < 6; i++) {
      await createDayOff(year, i + 1);
    }

    // cria uma vacation normal só para atualizar
    const normalVac = await VacationModel.create({
      ...basePayload,
      type: "normal",
      duration: 30,
      startDate: new Date(year, 6, 10),
    });

    await expect(
      VacationRepository.update({
        id: normalVac._id.toString(),
        payload: {
          type: "dayOff",
          duration: 0.5,
          period: "half",
        },
      })
    ).rejects.toThrow("Worker exceeds his annual dayOff limits (6).");
  });

  it("should ALLOW update to dayOff if one of the 6 dayOffs is cancelled (active = 5)", async () => {
    const year = new Date().getFullYear();

    // 5 ativos
    for (let i = 0; i < 5; i++) {
      await createDayOff(year, i + 1);
    }

    // 1 cancelado → total no DB = 6, mas só 5 ativos
    await createDayOff(year, 10, true);

    const normalVac = await VacationModel.create({
      ...basePayload,
      type: "normal",
      duration: 30,
      startDate: new Date(year, 6, 20),
    });

    const updated = await VacationRepository.update({
      id: normalVac._id.toString(),
      payload: {
        type: "dayOff",
        duration: 0.5,
        period: "half",
      },
    });

    expect(updated.type).toBe("dayOff");
    expect(updated.duration).toBe(0.5);
    expect(updated.cancelled).toBe(false);
    expect(updated.startDate.getFullYear()).toBe(year);
  });

  it("should allow update to dayOff when worker used less than 6 dayOffs", async () => {
    const year = new Date().getFullYear();

    // cria apenas 3 dayOffs
    for (let i = 0; i < 3; i++) {
      await createDayOff(year, i + 1);
    }

    const normalVac = await VacationModel.create({
      ...basePayload,
      type: "normal",
      duration: 15,
      startDate: new Date(year, 4, 10),
    });

    const updated = await VacationRepository.update({
      id: normalVac._id.toString(),
      payload: {
        type: "dayOff",
        duration: 0.5,
        period: "half",
      },
    });

    expect(updated.type).toBe("dayOff");
    expect(updated.duration).toBe(0.5);
  });

  it("should allow update to dayOff if 6 dayOffs exist but one in next year", async () => {
    const currentYear = new Date().getFullYear();

    // 5 this year
    for (let i = 1; i <= 5; i++) {
      await createDayOff(currentYear, 5);
    }
    await createDayOff(currentYear - 1, 5); // one past year

    const normalVac = await VacationModel.create({
      ...basePayload,
      type: "normal",
      duration: 30,
      startDate: new Date(currentYear, 6, 5),
    });

    const updated = await VacationRepository.update({
      id: normalVac._id.toString(),
      payload: {
        type: "dayOff",
        duration: 0.5,
        period: "half",
      },
    });

    expect(updated.type).toBe("dayOff");
    expect(updated.duration).toBe(0.5);
    expect(updated.startDate.getFullYear()).toBe(currentYear);
  });

  it("should NOT allow update to dayOff if one was took in this month, but allow in other month", async () => {
    const currentYear = new Date().getFullYear();

    const dayOff = await createDayOff(currentYear, 5);

    const normalVac = await VacationModel.create({
      ...basePayload,
      type: "normal",
      duration: 30,
      startDate: new Date(currentYear, 6, 5),
    });

    await expect(
      VacationRepository.update({
        id: normalVac._id.toString(),
        payload: {
          type: "dayOff",
          duration: 0.5,
          period: "half",
          startDate: set(dayOff.startDate, { date: 15 }).toISOString(),
        },
      })
    ).rejects.toThrow("Worker exceeds his monthly dayOff limits (1).");

    await expect(
      VacationRepository.update({
        id: normalVac._id.toString(),
        payload: {
          type: "dayOff",
          duration: 0.5,
          period: "half",
          startDate: set(dayOff.startDate, {
            date: 15,
            month: 2,
          }).toISOString(),
        },
      })
    ).resolves.toBeDefined();
  });
});
