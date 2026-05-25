import { VacationRepository } from "@/lib/repository/vacation/vacation";
import { createBaseEntities } from "./utils";
import type { BossDTO, DepartmentDTO } from "@/dto";
import { addDays, subDays } from "date-fns";
import { pluck } from "ramda";
import type { WorkerFormData } from "@/app/(secure)/worker/types";
import type { VacationFormData } from "@/app/(secure)/vacation/types";
import { WorkerRepository } from "@/lib/repository/worker/worker";

describe("VacationRepository.delete", () => {
  let boss: BossDTO;
  let baseVacation: any;
  let department: DepartmentDTO;
  const today = new Date();

  const createWorker = (override: Partial<WorkerFormData> = {}) =>
    WorkerRepository.create({
      admissionDate: today.toISOString(),
      department: department._id,
      matriculation: String(Math.round(10000 + Math.random() * 100000)),
      registry: String(Math.round(10000 + Math.random() * 100000)),
      name: `Worker ${Math.round(Math.random() * 100)}`,
      role: "role",
      isActive: true,
      ...override,
    });

  const createVacation = async (override: Partial<VacationFormData> = {}) => {
    const newWorker = await createWorker();
    return VacationRepository.create({
      duration: 15,
      type: "normal",
      period: "full",
      startDate: today.toISOString(),
      worker: newWorker._id.toString(),
      boss: boss._id.toString(),
      observation: "Initial obs",
      ...override,
    });
  };

  beforeEach(async () => {
    const { baseBoss, baseDepartment } = await createBaseEntities();
    boss = baseBoss;
    department = baseDepartment;

    baseVacation = await createVacation();
  });

  // time = undefined
  it("should return all vacations when time is not provided", async () => {
    const anotherVacation = await createVacation({
      startDate: addDays(today, 17).toISOString(),
    });

    const { data: vacations } = await VacationRepository.find({});
    const vacationsIds = pluck("_id", vacations);

    expect(vacations).toHaveLength(2);
    expect(vacationsIds).toContain(baseVacation._id);
    expect(vacationsIds).toContain(anotherVacation._id);
  });

  // time = { past: true }
  it("should return only past vacations when time is past", async () => {
    const pastVacation = await createVacation({
      startDate: subDays(today, 60).toISOString(),
    });

    const { data: vacations } = await VacationRepository.find({
      time: { past: true },
    });

    expect(vacations).toHaveLength(1);
    expect(vacations[0]._id).toEqual(pastVacation._id);
  });

  // time = { future: true }
  it("should return only future vacations when time is future", async () => {
    const futureVacation = await createVacation({
      startDate: addDays(today, 60).toISOString(),
    });

    const { data: vacations } = await VacationRepository.find({
      time: { future: true },
    });

    expect(vacations).toHaveLength(1);
    expect(vacations[0]._id).toEqual(futureVacation._id);
  });

  // time = { now: true }
  it("should return only ongoing vacations when time is now", async () => {
    await createVacation({ startDate: addDays(today, 60).toISOString() }); //future vacation
    await createVacation({ startDate: subDays(today, 60).toISOString() }); // past vacation

    const { data: vacations } = await VacationRepository.find({
      time: { now: true },
    });

    expect(vacations).toHaveLength(1);
    expect(vacations[0]._id).toEqual(baseVacation._id);
  });

  // time = { past: true, now: true }
  it("should return past and ongoing vacations when time is past and now", async () => {
    await createVacation({ startDate: addDays(today, 60).toISOString() }); //future vacation
    const pastVacation = await createVacation({
      startDate: subDays(today, 60).toISOString(),
    }); // past vacation

    const { data: vacations } = await VacationRepository.find({
      time: { past: true, now: true },
    });
    3;
    const vacationsIds = pluck("_id", vacations);

    expect(vacations).toHaveLength(2);
    expect(vacationsIds).toContain(baseVacation._id);
    expect(vacationsIds).toContain(pastVacation._id);
  });

  // time = { future: true, now: true }
  it("should return future and ongoing vacations when time is future and now", async () => {
    const futureVacation = await createVacation({
      startDate: addDays(today, 60).toISOString(),
    }); //future vacation
    await createVacation({
      startDate: subDays(today, 60).toISOString(),
    }); // past vacation

    const { data: vacations } = await VacationRepository.find({
      time: { future: true, now: true },
    });
    3;
    const vacationsIds = pluck("_id", vacations);

    expect(vacations).toHaveLength(2);
    expect(vacationsIds).toContain(baseVacation._id);
    expect(vacationsIds).toContain(futureVacation._id);
  });

  // time = { past: true, future: true }
  it("should return past and future vacations but not ongoing when time is past and future", async () => {
    const futureVacation = await createVacation({
      startDate: addDays(today, 60).toISOString(),
    }); //future vacation
    const pastVacation = await createVacation({
      startDate: subDays(today, 60).toISOString(),
    }); // past vacation

    const { data: vacations } = await VacationRepository.find({
      time: { future: true, past: true },
    });
    3;
    const vacationsIds = pluck("_id", vacations);

    expect(vacations).toHaveLength(2);
    expect(vacationsIds).toContain(pastVacation._id);
    expect(vacationsIds).toContain(futureVacation._id);
  });

  // time = { past: true, future: true, now: true }
  it("should return all vacations when all time flags are true", async () => {
    const futureVacation = await createVacation({
      startDate: addDays(today, 60).toISOString(),
    }); //future vacation
    const pastVacation = await createVacation({
      startDate: subDays(today, 60).toISOString(),
    }); // past vacation

    const { data: vacations } = await VacationRepository.find({
      time: { future: true, now: true, past: true },
    });
    3;
    const vacationsIds = pluck("_id", vacations);

    expect(vacations).toHaveLength(3);
    expect(vacationsIds).toContain(baseVacation._id);
    expect(vacationsIds).toContain(pastVacation._id);
    expect(vacationsIds).toContain(futureVacation._id);
  });

  it("should return only vacations starting before 'to' date when to is provided", async () => {
    const to = today;
    const beforeTo = await createVacation({
      startDate: subDays(to, 60).toISOString(),
    });

    await createVacation({
      startDate: addDays(to, 60).toISOString(),
    }); // after to

    const { data: vacations } = await VacationRepository.find({
      time: { to },
    });
    3;
    const vacationsIds = pluck("_id", vacations);

    expect(vacations).toHaveLength(2);
    expect(vacationsIds).toContain(baseVacation._id);
    expect(vacationsIds).toContain(beforeTo._id);
  });
  it("should return only vacations ending after 'from' date when from is provided", async () => {
    const from = today;
    await createVacation({
      startDate: subDays(from, 60).toISOString(),
    }); //bofore from

    const afterFrom = await createVacation({
      startDate: addDays(from, 60).toISOString(),
    }); // after from

    const { data: vacations } = await VacationRepository.find({
      time: { from },
    });
    3;
    const vacationsIds = pluck("_id", vacations);

    expect(vacations).toHaveLength(2);
    expect(vacationsIds).toContain(baseVacation._id);
    expect(vacationsIds).toContain(afterFrom._id);
  });
  it("should return vacations within range when both from and to are provided", async () => {
    const to = addDays(today, 10);
    const from = subDays(today, 10);

    const vacationEndsAfterFrom = await createVacation({
      startDate: subDays(from, 5).toISOString(),
    });
    const vacationsStartBeforeTo = await createVacation({
      startDate: subDays(to, 5).toISOString(),
    });
    const vacationEndBeforeFrom = await createVacation({
      startDate: subDays(from, 20).toISOString(),
    });
    const vacationStartAfterTo = await createVacation({
      startDate: addDays(to, 5).toISOString(),
    });

    const { data: vacations } = await VacationRepository.find({
      time: { to, from },
    });
    const vacationsIds = pluck("_id", vacations);

    expect(vacations).toHaveLength(3);
    expect(vacationsIds).toContain(baseVacation._id);
    expect(vacationsIds).toContain(vacationEndsAfterFrom._id);
    expect(vacationsIds).toContain(vacationsStartBeforeTo._id);

    expect(vacationsIds).not.toContain(vacationEndBeforeFrom._id);
    expect(vacationsIds).not.toContain(vacationStartAfterTo._id);
  });
  it("should return empty array when no vacations fall within from/to range", async () => {
    const to = subDays(today, 30);
    const from = subDays(today, 60);
    await createVacation({
      startDate: subDays(from, 30).toISOString(),
    }); // ends before range
    await createVacation({
      startDate: addDays(to, 30).toISOString(),
    }); // starts after range

    const { data: vacations } = await VacationRepository.find({
      time: { to, from },
    });

    expect(vacations).toHaveLength(0);
  });

  // edge cases
  it("should consider boolean properties(past, now, future) if all properties are setted", async () => {
    const to = addDays(today, 10);
    const from = subDays(today, 10);
    const pastVacation = await createVacation({
      startDate: subDays(today, 20).toISOString(),
    });
    const futureVacation = await createVacation({
      startDate: addDays(today, 5).toISOString(),
    });
    const { data: vacations } = await VacationRepository.find({
      time: { to, from, past: true, now: true, future: true },
    });
    const vacationsIds = pluck("_id", vacations);
    expect(vacationsIds).toContain(pastVacation._id);
    expect(vacationsIds).toContain(futureVacation._id);
    expect(vacationsIds).toContain(baseVacation._id);
  });

  it("should not return a vacation that ended before today when time is future", async () => {
    const endedVacation = await createVacation({
      startDate: subDays(today, 20).toISOString(),
    });
    const { data: vacations } = await VacationRepository.find({
      time: { future: true },
    });
    const vacationsIds = pluck("_id", vacations);
    expect(vacationsIds).not.toContain(endedVacation._id);
  });

  it("should not return a vacation starting after today when time is past", async () => {
    const futureVacation = await createVacation({
      startDate: addDays(today, 10).toISOString(),
    });
    const { data: vacations } = await VacationRepository.find({
      time: { past: true },
    });
    const vacationsIds = pluck("_id", vacations);
    expect(vacationsIds).not.toContain(futureVacation._id);
  });

  it("should return a vacation that starts today when time is now", async () => {
    const { data: vacations } = await VacationRepository.find({
      time: { now: true },
    });
    const vacationsIds = pluck("_id", vacations);
    expect(vacationsIds).toContain(baseVacation._id);
  });

  it("should return a vacation that ends today when time is now", async () => {
    const endsToday = await createVacation({
      startDate: subDays(today, 5).toISOString(),
    });
    const { data: vacations } = await VacationRepository.find({
      time: { now: true },
    });
    const vacationsIds = pluck("_id", vacations);

    expect(vacationsIds).toContain(endsToday._id);
    expect(vacationsIds).toContain(baseVacation._id);
  });

  it("should return empty array when no vacations match the time condition", async () => {
    const { data: vacations } = await VacationRepository.find({
      time: { future: true },
    });
    expect(vacations).toHaveLength(0);
  });
});
