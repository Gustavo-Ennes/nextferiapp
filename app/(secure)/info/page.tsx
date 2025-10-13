import {
  getTodayReturns,
  getUpcomingLeaves,
  getUpcomingReturns,
  getWorkersOnVacation,
} from "@/app/utils";
import { Dashboard } from "./components/Dashboard";
import { fetchAllPaginated } from "../utils";
import type { Department, Vacation, Worker } from "@/app/types";
import { groupBy, prop } from "ramda";

export default async function DashboardServer() {
  const [vacations, workers, departments] = await Promise.all([
    fetchAllPaginated<Vacation>({ type: "vacation", params: { type: "all" } }),
    fetchAllPaginated<Worker>({ type: "worker" }),
    fetchAllPaginated<Department>({ type: "department" }),
  ]);

  const onVacationToday = getWorkersOnVacation(vacations);
  const returningToday = getTodayReturns(vacations);
  const upcomingLeaves = getUpcomingLeaves(vacations);
  const upcomingReturns = getUpcomingReturns(vacations);
  const activeAndInternalWorkers = workers.filter(
    (worker) =>
      worker.isActive && (worker.isExternal === false || !worker.isExternal)
  );

  const workersByRole = groupBy(
    prop("role"),
    activeAndInternalWorkers.map((worker) => ({
      ...worker,
      role: worker.role.toLowerCase(),
    }))
  );

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
        workersByRole,
      }}
    />
  );
}
