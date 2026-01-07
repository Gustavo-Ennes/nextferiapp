import { genericResponseWithHeaders, optionsResponse } from "../../utils";
import { WeeklyFuellingSummaryRepository } from "@/lib/repository/weeklyFuellingSummary/weeklyFuellingSummary";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const weeklySummary =
      await WeeklyFuellingSummaryRepository.findByWeekStart();

    if (!weeklySummary) throw new Error("No weeklyFuellingSummary found.");

    return genericResponseWithHeaders({ data: weeklySummary });
  } catch (error) {
    console.error("FUELLING SUMMARY GET[id] ~ error:", error);
    return genericResponseWithHeaders({
      error: (error as Error).message,
    });
  }
}
