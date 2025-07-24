import {
  getTodayReturns,
  getUpcomingLeaves,
  getUpcomingReturns,
  getWorkersOnVacation,
} from "@/app/utils";
import { Dashboard } from "./components/Dashboard";

export default async function DashboardServer() {
  const [vacationsRes, workersRes, departmentsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/vacation`, {
      cache: "no-store",
    }),
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/worker`, {
      cache: "no-store",
    }),
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/department`, {
      cache: "no-store",
    }),
  ]);

  const { data: vacations } = await vacationsRes.json();
  const { data: workers } = await workersRes.json();
  const { data: departments } = await departmentsRes.json();
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
