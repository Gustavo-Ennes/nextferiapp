import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import {
  genericResponseWithHeaders,
  optionsResponse,
  responseWithHeaders,
} from "../../utils";
import { FuelingWeeklySummaryRepository } from "@/lib/repository/weeklyFuellingSummary/weeklyFuellingSummary";
import { type WeeklyFuellingSummary } from "@/models/WeeklyFuellingSummary";
import { Types } from "mongoose";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    if (!id) throw new Error("No id provided.");

    const weeklySummary = await FuelingWeeklySummaryRepository.find(id);

    if (!weeklySummary) throw new Error("No weeklyFuellingSummary found.");

    return responseWithHeaders<WeeklyFuellingSummary>({ data: weeklySummary });
  } catch (error) {
    console.error("FUELLING SUMMARY GET[id] ~ error:", error);
    return responseWithHeaders<WeeklyFuellingSummary>({
      error: (error as Error).message,
    });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  await FuelingWeeklySummaryRepository.delete(new Types.ObjectId(id));

  return genericResponseWithHeaders({ data: { success: true } });
}
