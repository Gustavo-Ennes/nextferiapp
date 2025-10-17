import type { Vacation } from "@/app/types";
import dbConnect from "@/lib/database/database";
import type { NextRequest } from "next/server";
import {
  optionsResponse,
  responseWithHeaders,
  updateVacationDates,
} from "../utils";
import { revalidatePath } from "next/cache";
import { VacationRepository } from "@/lib/repository/vacation";
import type { VacationType } from "@/app/(secure)/vacation/types";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as VacationType;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const worker = searchParams.get("worker");
    const contains = searchParams.get("contains"); // O termo de busca

    const { data, totalItems, totalPages } = await VacationRepository.find({
      type,
      page,
      worker,
      contains,
    });

    const response = responseWithHeaders<Vacation>({
      data,
      currentPage: page,
      totalItems,
      totalPages,
      limit: 20,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });

    return response;
  } catch (error) {
    console.error("VACATION GET ~ error:", error);
    return responseWithHeaders<Vacation>({ error: (error as Error).message });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  try {
    const bodyWithUpdatedDates = updateVacationDates(body);
    const vacation = await VacationRepository.create(bodyWithUpdatedDates);

    revalidatePath("/vacation");

    return responseWithHeaders<Vacation>({ data: vacation });
  } catch (error) {
    console.error("VACATION POST ~ error:", error);
    return responseWithHeaders<Vacation>({ error: (error as Error).message });
  }
}
