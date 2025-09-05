import {
  getTodayReturns,
  getUpcomingLeaves,
  getUpcomingReturns,
  getWorkersOnVacation,
} from "@/app/utils";
import { Dashboard } from "./components/Dashboard";
import { fetchAllPaginated } from "../utils";
import type { Department, Vacation, Worker } from "@/app/types";

export default async function DashboardServer() {
  const [vacations, workers, departments] = await Promise.all([
    fetchAllPaginated<Vacation>({ type: "vacation" }),
    fetchAllPaginated<Worker>({ type: "worker" }),
    fetchAllPaginated<Department>({ type: "department" }),
  ]);

  const onVacationToday = getWorkersOnVacation(vacations);
  const returningToday = getTodayReturns(vacations);
  const upcomingLeaves = getUpcomingLeaves(vacations);
  const upcomingReturns = getUpcomingReturns(vacations);

  return (
    <Dashboard
      data={{
        vacations: vacations,
        workers: workers,
        departments: departments,
        onVacationToday,
        returningToday,
        upcomingLeaves,
        upcomingReturns,
      }}
    />
  );
}
