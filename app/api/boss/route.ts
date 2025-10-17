import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import type { Boss } from "@/app/types";
import {
  optionsResponse,
  PAGINATION_LIMIT,
  responseWithHeaders,
} from "../utils";
import { parseBool } from "@/app/(secure)/components/utils";
import { BossRepository } from "@/lib/repository/boss";

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

    const { data, totalItems, totalPages } = await BossRepository.find({
      page,
      contains,
      isExternal,
      isActive,
    });

    return responseWithHeaders<Boss>({
      data,
      currentPage: page,
      totalItems,
      totalPages,
      limit: PAGINATION_LIMIT,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("BOSS GET ~ error:", error);
    return responseWithHeaders<Boss>({ error: (error as Error).message });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  try {
    const boss = await BossRepository.create(body);

    return responseWithHeaders({ data: boss });
  } catch (error) {
    console.error("BOSS POST ~ error:", error);
    return responseWithHeaders({ error: (error as Error).message });
  }
}
