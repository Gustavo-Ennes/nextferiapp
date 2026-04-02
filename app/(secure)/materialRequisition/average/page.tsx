import { WeeklyFuellingSummaryRepository } from "@/lib/repository/weeklyFuellingSummary/weeklyFuellingSummary";
import { WeeklySummaryView } from "./WeeklySummaryView";
import { FuelRepository } from "@/lib/repository/fuel/fuel";

export default async function WeeklyFuellingSummaryPage() {
  const summaries = await WeeklyFuellingSummaryRepository.find();
  const fuels = await FuelRepository.findWithoutPagination!({});

  return <WeeklySummaryView summaries={summaries} fuels={fuels} />;
}
