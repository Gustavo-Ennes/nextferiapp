import { NextRequest } from "next/server";
import { genericResponseWithHeaders, optionsResponse } from "../../utils";
import { WeeklyFuellingSummaryRepository } from "@/lib/repository/weeklyFuellingSummary/weeklyFuellingSummary";

export async function OPTIONS() {
  return optionsResponse();
}

export async function DELETE(req: NextRequest) {
  const { url } = req;
  const id = url?.split("/").pop();

  if (!id) throw new Error("No id provided.");

  await WeeklyFuellingSummaryRepository.delete(id);

  return genericResponseWithHeaders({ data: { success: true } });
}
