import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import { genericResponseWithHeaders, optionsResponse } from "../../utils";
import { WeeklyFuellingSummaryRepository } from "@/lib/repository/weeklyFuellingSummary/weeklyFuellingSummary";
import { Types } from "mongoose";

export async function OPTIONS() {
  return optionsResponse();
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  await WeeklyFuellingSummaryRepository.delete(new Types.ObjectId(id));

  return genericResponseWithHeaders({ data: { success: true } });
}
