// import { generateWeeklyFuellingSummaryMock } from "./mock";
import type { WeeklyFuellingSummary } from "@/models/types";
import { WeeklySummaryView } from "./WeeklySummaryView";

async function getWeeklySummaries() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/weeklyFuellingSummary/actual`,
    { cache: "no-store" }
  );

  if (!res.ok) console.info("No weekly summary found.");

  const { data } = await res.json();
  return data;
  // const mockedSummaries = generateWeeklyFuellingSummaryMock({
  //   departmentsPerWeek: { min: 10, max: 20 },
  //   fuellingsPerVehicle: { min: 1, max: 6 },
  //   litersPerFuelling: { min: 10, max: 100 },
  //   vehiclesPerDepartment: { min: 3, max: 20 },
  //   weeks: 20,
  // });
  // return mockedSummaries;
}

export default async function WeeklyFuellingSummaryPage() {
  const summaries = await getWeeklySummaries();

  return <WeeklySummaryView summaries={summaries as WeeklyFuellingSummary[]} />;
}
