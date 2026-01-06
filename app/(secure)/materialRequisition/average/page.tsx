// import { generateWeeklyFuellingSummaryMock } from "./mock";
import { WeeklySummaryView } from "./WeeklySummaryView";
import { fetchWeeklyFuellingSummaries } from "../../utils";

export default async function WeeklyFuellingSummaryPage() {
  const summaries = await fetchWeeklyFuellingSummaries();

  return <WeeklySummaryView summaries={summaries} />;
}
