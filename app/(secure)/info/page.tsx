import {
  getTodayReturns,
  getUpcomingLeaves,
  getUpcomingReturns,
  getWorkersOnVacation,
} from "@/app/utils";
import { Dashboard } from "./components/Dashboard";
import { groupBy, prop } from "ramda";
import type { DepartmentDTO, VacationDTO, WorkerDTO } from "@/dto";
import { fetchAll } from "../utils";
import { VacationRepository } from "@/lib/repository/vacation/vacation";
import { WorkerRepository } from "@/lib/repository/worker/worker";
import { DepartmentRepository } from "@/lib/repository/department/department";
import type { DepartmentFormData } from "../department/types";
import type { VacationFormData } from "../vacation/types";
import type { WorkerFormData } from "../worker/types";

export default async function DashboardServer() {
  const vacations = await fetchAll<VacationDTO, VacationFormData>({
    type: "all",
    cancelled: false,
    entityType: "vacation",
    repository: VacationRepository,
  });
  const workers = await fetchAll<WorkerDTO, WorkerFormData>({
    entityType: "worker",
    repository: WorkerRepository,
  });
  const departments = await fetchAll<DepartmentDTO, DepartmentFormData>({
    entityType: "department",
    repository: DepartmentRepository,
    isActive: true,
  });

  const onVacationToday = getWorkersOnVacation(vacations);
  const returningToday = getTodayReturns(vacations);
  const upcomingLeaves = getUpcomingLeaves(vacations);
  const upcomingReturns = getUpcomingReturns(vacations);
  const activeAndInternalWorkers = workers.filter(
    (worker) =>
      worker.isActive && (worker.isExternal === false || !worker.isExternal),
  );

  const workersByRole = groupBy(
    prop("role"),
    activeAndInternalWorkers.map((worker) => ({
      ...worker,
      role: worker.role.toLowerCase(),
    })),
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
