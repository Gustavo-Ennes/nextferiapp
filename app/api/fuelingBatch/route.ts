import { NextRequest } from "next/server";
import {
  genericResponseWithHeaders,
  optionsResponse,
  PAGINATION_LIMIT,
  responseWithHeaders,
} from "../utils";
import { FuelingBatchRepository } from "@/lib/repository/fuelingBatch/fuelingBatch";
import type { FuelingBatchDTO } from "@/dto";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const { data, totalItems, totalPages } = await FuelingBatchRepository.find({
      page,
    });

    const response = responseWithHeaders<FuelingBatchDTO>({
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
    console.error("FUELLING BATCH GET ~ error:", error);
    return genericResponseWithHeaders({
      error: (error as Error).message,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = body.payload;

    const createdOrUpdateFuelingBatch =
      await FuelingBatchRepository.create(payload);

    return genericResponseWithHeaders({
      data: createdOrUpdateFuelingBatch,
    });
  } catch (error) {
    console.error("FUELLING BATCH POST ~ error:", error);
    return genericResponseWithHeaders({
      error: (error as Error).message,
    });
  }
}
