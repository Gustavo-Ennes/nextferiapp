import WorkerModel, { type Worker } from "@/models/Worker";
import VacationModel, {
  type OldVacation,
  type TransitionVacation,
  type Vacation,
} from "@/models/Vacation";
import BossModel, { type Boss } from "@/models/Boss";
import { startOfDay, set } from "date-fns";
import type {
  VacationDuration,
  VacationType,
} from "@/app/(secure)/vacation/types";

export const afterInit = async () => {
  const workers = await WorkerModel.find();
  const vacations = await VacationModel.find();
  const boss: Boss | null = await BossModel.findOne({
    isDirector: true,
    isActive: true,
  });

  if (!boss) console.error(`Add a boss(director, active) to your database.`);

  await fixVacations(vacations, boss as Boss);
  await fixWorkers(workers);
};

const fixWorkers = async (workers: Worker[]) => {
  const problematicWorkers: Worker[] = [];
  let successCounter = 0;

  for (let i = 0; i < workers.length; i++) {
    const worker = workers[i];

    try {
      worker.isActive = true;
      worker.matriculation = extractDigits(worker.matriculation);

      if (!worker.isActive)
        throw new Error(`Unable to parse 'isActive': ${worker.isActive}`);
      if (!worker.isActive)
        throw new Error(`Unable to parse 'isActive': ${worker.isActive}`);

      await worker.save();
      successCounter++;
    } catch (err) {
      console.error(`${err}\nworker: ${JSON.stringify(worker, null, 2)}`);
      problematicWorkers.push(worker);
    }
  }
  console.info(`
        ${workers.length} workers total.
        ${successCounter} parsed successfully.
        ${problematicWorkers.length} not parsed.

        ${JSON.stringify({ problematicWorkers }, null, 2)}
      `);
};

const extractDigits = (input: unknown): string => {
  if (typeof input !== "string") {
    if (input === null || input === undefined) return "";
    input = String(input);
  }

  return (input as string).replace(/\D+/g, "").trim();
};

const fixVacations = async (vacations: TransitionVacation[], boss: Boss) => {
  const problematicVacations: TransitionVacation[] = [];
  const counter = { success: 0 };

  for (let i = 0; i < vacations.length; i++) {
    const oldVacation = vacations[i] as OldVacation;
    const newVacation = vacations[i] as Vacation;

    try {
      if (!newVacation.boss && boss) newVacation.boss = boss;
      if (!newVacation.duration)
        newVacation.duration = oldVacation.daysQtd as VacationDuration;
      if (oldVacation.type === "vacation") newVacation.type = "normal";
      newVacation.startDate = startOfDay(new Date(oldVacation.startDate));
      newVacation.endDate = calculateEndDate(
        oldVacation as unknown as Vacation
      );
      newVacation.period =
        (newVacation.duration as number) >= 1 ? "full" : "half";
      newVacation.cancelled = false;

      if (!newVacation.period)
        throw new Error(`Unable to parse 'period': ${newVacation.period}`);
      if (![0.5, 1, 15, 30, 45, 60, 75, 90].includes(newVacation.duration))
        throw new Error(`Unable to parse 'duration': ${newVacation.duration}`);
      if (!newVacation.startDate)
        throw new Error(
          `Unable to parse 'startDate': ${newVacation.startDate}`
        );
      if (!newVacation.endDate)
        throw new Error(`Unable to parse 'endDate': ${newVacation.endDate}`);
      if (!newVacation.endDate)
        throw new Error(`Unable to parse 'endDate': ${newVacation.endDate}`);
      if (newVacation.cancelled === null || newVacation.cancelled === undefined)
        throw new Error(
          `Unable to parse 'cancelled': ${newVacation.cancelled}`
        );
      if (
        newVacation.type === ("vacation" as VacationType) ||
        newVacation.type === null ||
        newVacation.type === undefined
      )
        throw new Error(`Unable to parse 'type': ${newVacation.type}`);

      await newVacation.save();
      counter.success++;
    } catch (err) {
      console.error(`${err}\noldVacation: ${JSON.stringify(oldVacation)}`);
      problematicVacations.push(oldVacation);
    }
  }
  console.info(`
        ${vacations.length} vacations total.
        ${counter.success} parsed successfully.
        ${problematicVacations.length} not parsed.

        ${JSON.stringify(
          { problematicVacations: problematicVacations.length },
          null,
          2
        )}
      `);
};

const calculateEndDate = ({
  startDate,
  endDate,
  duration,
  daysQtd,
}: Vacation) => {
  const startDateZeroHour = startOfDay(startDate);
  const daysToAdd = (duration ?? daysQtd) as number;
  endDate = set(startDateZeroHour, {
    ...(daysToAdd >= 1 && { date: new Date(startDate).getDate() + daysToAdd }),
    ...(daysToAdd < 1 && { hours: 12 }),
    milliseconds: -1,
  });
  return endDate;
};
