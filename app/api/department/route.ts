import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import type { Department } from "@/app/types";
import {
  optionsResponse,
  responseWithHeaders,
  PAGINATION_LIMIT,
} from "../utils";
import { parseBool } from "@/app/(secure)/components/utils";
import { DepartmentRepository } from "@/lib/repository/department";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const contains = searchParams.get("contains");
    const isActive = parseBool(searchParams.get("isActive"));

    const { data, totalItems, totalPages } = await DepartmentRepository.find({
      page,
      contains,
      isActive,
    });

    return responseWithHeaders<Department>({
      data,
      currentPage: page,
      totalItems,
      totalPages,
      limit: PAGINATION_LIMIT,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("DEPARTMENT GET ~ error:", error);
    return responseWithHeaders<Department>({ error: (error as Error).message });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  try {
    const department = await DepartmentRepository.create(body);

    return responseWithHeaders<Department>({ data: department });
  } catch (error) {
    console.error("DEPARTMENT POST ~ error:", error);
    return responseWithHeaders<Department>({ error: (error as Error).message });
  }
}
