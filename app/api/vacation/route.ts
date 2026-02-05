import type { NextRequest } from "next/server";
import {
  optionsResponse,
  PAGINATION_LIMIT,
  responseWithHeaders,
} from "../utils";
import { revalidatePath } from "next/cache";
import { VacationRepository } from "@/lib/repository/vacation/vacation";
import type { VacationType } from "@/lib/repository/vacation/types";
import { endOfDay } from "date-fns";
import { startOfDaySP } from "@/app/utils";
import { parseBool } from "@/app/(secure)/components/utils";
import type { VacationDTO } from "@/dto";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as VacationType;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const worker = searchParams.get("worker");
    const contains = searchParams.get("contains");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const cancelled = parseBool(searchParams.get("cancelled"));
    const exclude = searchParams.get("exclude");
    const fromDate = from ? startOfDaySP(new Date(from)) : null;
    const toDate = to ? endOfDay(startOfDaySP(new Date(to))) : null;


    //TIRAR LOGS, TESTES, BUILD, MERGE

    const { data, totalItems, totalPages } = await VacationRepository.find({
      type,
      page,
      worker,
      contains,
      from: fromDate,
      to: toDate,
      cancelled,
      exclude,
    });

    const response = responseWithHeaders<VacationDTO>({
      data,
      currentPage: page,
      totalItems,
      totalPages,
      limit: PAGINATION_LIMIT,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });

    return response;
  } catch (error) {
    console.error("VACATION GET ~ error:", error);
    return responseWithHeaders<VacationDTO>({
      error: (error as Error).message,
    });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const vacation = await VacationRepository.create(body);

    revalidatePath("/vacation");

    return responseWithHeaders<VacationDTO>({ data: vacation });
  } catch (error) {
    console.error("VACATION POST ~ error:", error);
    return responseWithHeaders<VacationDTO>({
      error: (error as Error).message,
    });
  }
}
