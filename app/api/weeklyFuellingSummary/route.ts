import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import {
  genericResponseWithHeaders,
  optionsResponse,
  responseWithHeaders,
} from "../utils";
import { WeeklyFuellingSummaryRepository } from "@/lib/repository/weeklyFuellingSummary/weeklyFuellingSummary";
import { type WeeklyFuellingSummary } from "@/models/WeeklyFuellingSummary";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  await dbConnect();

  try {
    const summaries = await WeeklyFuellingSummaryRepository.find();

    return genericResponseWithHeaders({ data: summaries });
  } catch (error) {
    console.error("FUELLING SUMMARY GET ~ error:", error);
    return responseWithHeaders<WeeklyFuellingSummary>({
      error: (error as Error).message,
    });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const payload = body.payload;

  const createdOrUpdateWeeklySummary =
    await WeeklyFuellingSummaryRepository.createOrUpdate(payload);

  return responseWithHeaders<WeeklyFuellingSummary>({
    data: createdOrUpdateWeeklySummary as WeeklyFuellingSummary,
  });
}
