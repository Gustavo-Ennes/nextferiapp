// import { startOfDay, set } from "date-fns";
import WorkerModel, { type Worker } from "@/models/Worker";
import VacationModel, {
  type TransitionVacation,
  // type Vacation,
} from "@/models/Vacation";

export const afterInit = async () => {
  const workers = await WorkerModel.find();
  const vacations = await VacationModel.find();
  await fixVacations(vacations);
  await fixWorkers(workers);
};

const fixWorkers = async (workers: Worker[]) => {
  workers.forEach(async (worker) => {
    worker.isActive = true;
    worker.matriculation = extractDigits(worker.matriculation);
    await worker.save();
  });
};

const extractDigits = (input: unknown): string => {
  if (typeof input !== "string") {
    if (input === null || input === undefined) return "";
    input = String(input);
  }

  return (input as string).replace(/\D+/g, "").trim();
};

const fixVacations = async (vacations: TransitionVacation[]) => {
  console.log("🚀 ~ fixVacations ~ vacations:", vacations);
  // vacations.forEach(async (vacation: TransitionVacation) => {
  //   console.log(`
  //     _______________________________________
  //     BEFORE startTime: ${vacation.startDate}
  //     BEFORE endTime: ${vacation.endDate}
  //     BEFORE period: ${vacation.period}
  //     BEFORE cancelled: ${vacation.cancelled}`);

  //   if (!vacation.duration as Vacation) vacation.duration = vacation.daysQtd;
  //   if (vacation.type === "vacation") vacation.type = "normal";
  //   vacation.startDate = startOfDay(new Date(vacation.startDate));
  //   vacation.endDate = calculateEndDate(vacation);
  //   vacation.period = (vacation.duration as number) >= 1 ? "full" : "half";
  //   vacation.cancelled = false;

  //   console.log(`
  //     AFTER startTime: ${vacation.startDate.toISOString()}
  //     AFTER endTime: ${vacation.endDate.toISOString()}
  //     AFTER period: ${vacation.period}
  //     AFTER cancelled: ${vacation.cancelled}
  //     _______________________________________`);

  //   await vacation.save();
  // });
};

// const calculateEndDate = ({
//   startDate,
//   endDate,
//   duration,
//   daysQtd,
// }: Vacation) => {
//   const startDateZeroHour = startOfDay(startDate);
//   const daysToAdd = (duration ?? daysQtd) as number;
//   endDate = set(startDateZeroHour, {
//     ...(daysToAdd >= 1 && { date: new Date(startDate).getDate() + daysToAdd }),
//     ...(daysToAdd < 1 && { hours: 12 }),
//     milliseconds: -1,
//   });
//   return endDate;
// };
