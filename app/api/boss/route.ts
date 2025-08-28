import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import BossModel from "@/models/Boss";
import type { Boss } from "@/app/types";
import type { PaginatedResponse } from "../types";

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

    return NextResponse.json<PaginatedResponse<Boss>>({
      data,
      currentPage: page,
      totalItems,
      totalPages,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    return NextResponse.json({ error });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  try {
    const boss = await BossModel.create(body);

    return NextResponse.json({ data: boss });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
