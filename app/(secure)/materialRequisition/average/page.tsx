// import { generateWeeklyFuellingSummaryMock } from "./mock";

import { WeeklyFuellingSummaryRepository } from "@/lib/repository/weeklyFuellingSummary/weeklyFuellingSummary";
import { WeeklySummaryView } from "./WeeklySummaryView";

export default async function WeeklyFuellingSummaryPage() {
  const summaries = await WeeklyFuellingSummaryRepository.find();

  return <WeeklySummaryView summaries={summaries} />;
}
