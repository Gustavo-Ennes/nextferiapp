import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import { optionsResponse, responseWithHeaders } from "../utils";
import { FuelingWeeklySummaryRepository } from "@/lib/repository/weeklyFuellingSummary/weeklyFuellingSummary";
import { type WeeklyFuellingSummary } from "@/models/WeeklyFuellingSummary";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const id = body.id;
  const payload = body.payload;

  const createdOrUpdateWeeklySummary =
    await FuelingWeeklySummaryRepository.createOrUpdate(payload, id);

  return responseWithHeaders<WeeklyFuellingSummary>({
    data: createdOrUpdateWeeklySummary as WeeklyFuellingSummary,
  });
}
