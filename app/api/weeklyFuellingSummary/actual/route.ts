import dbConnect from "@/lib/database/database";
import { optionsResponse, responseWithHeaders } from "../../utils";
import { WeeklyFuellingSummaryRepository } from "@/lib/repository/weeklyFuellingSummary/weeklyFuellingSummary";
import { type WeeklyFuellingSummary } from "@/models/WeeklyFuellingSummary";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  await dbConnect();
  try {
    const weeklySummary =
      await WeeklyFuellingSummaryRepository.findByWeekStart();

    if (!weeklySummary) throw new Error("No weeklyFuellingSummary found.");

    return responseWithHeaders<WeeklyFuellingSummary>({ data: weeklySummary });
  } catch (error) {
    console.error("FUELLING SUMMARY GET[id] ~ error:", error);
    return responseWithHeaders<WeeklyFuellingSummary>({
      error: (error as Error).message,
    });
  }
}
