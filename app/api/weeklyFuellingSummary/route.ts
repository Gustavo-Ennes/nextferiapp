import { NextRequest } from "next/server";
import { genericResponseWithHeaders, optionsResponse } from "../utils";
import { WeeklyFuellingSummaryRepository } from "@/lib/repository/weeklyFuellingSummary/weeklyFuellingSummary";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const summaries = await WeeklyFuellingSummaryRepository.find();

    return genericResponseWithHeaders({ data: summaries });
  } catch (error) {
    console.error("FUELLING SUMMARY GET ~ error:", error);
    return genericResponseWithHeaders({
      error: (error as Error).message,
    });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const payload = body.payload;

  const createdOrUpdateWeeklySummary =
    await WeeklyFuellingSummaryRepository.createOrUpdate(payload);

  return genericResponseWithHeaders({
    data: createdOrUpdateWeeklySummary,
  });
}
