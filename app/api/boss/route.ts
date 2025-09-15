import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import BossModel from "@/models/Boss";
import type { Boss } from "@/app/types";
import { optionsResponse, responseWithHeaders } from "../utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const skip = (page - 1) * limit;

    const filter = {
      isActive: true,
    };
    const [data, totalItems] = await Promise.all([
      BossModel.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .populate("worker"),
      BossModel.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(totalItems / limit);

    return responseWithHeaders<Boss>({
      data,
      currentPage: page,
      totalItems,
      totalPages,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    return responseWithHeaders<Boss>({ error: (error as Error).message });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  try {
    const boss = await BossModel.create(body);

    return responseWithHeaders({ data: boss });
  } catch (error) {
    return responseWithHeaders({ error: (error as Error).message });
  }
}
