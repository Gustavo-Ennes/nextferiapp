import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import type { Worker } from "@/app/types";
import { revalidatePath } from "next/cache";
import {
  responseWithHeaders,
  optionsResponse,
  PAGINATION_LIMIT,
} from "../utils";
import { parseBool } from "@/app/(secure)/components/utils";
import { WorkerRepository } from "@/lib/repository/worker";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const contains = searchParams.get("contains");
    const isExternal = parseBool(searchParams.get("isExternal"));
    const isActive = parseBool(searchParams.get("isActive"));

    const { data, totalItems, totalPages } = await WorkerRepository.find({
      page,
      contains,
      isExternal,
      isActive,
    });

    return responseWithHeaders<Worker>({
      data,
      currentPage: page,
      totalItems,
      totalPages,
      limit: PAGINATION_LIMIT,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("WORKER GET ~ error:", error);
    return responseWithHeaders<Worker>({ error: (error as Error).message });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  try {
    const worker = await WorkerRepository.create(body);

    revalidatePath("/worker");
    return responseWithHeaders<Worker>({ data: worker });
  } catch (error) {
    console.error("WORKER POST ~ error:", error);
    return responseWithHeaders<Worker>({ error: (error as Error).message });
  }
}

// TODO colocar admissionDate no form do worker
