import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import type { Worker } from "@/app/types";
import WorkerModel from "@/models/Worker";
import { revalidatePath } from "next/cache";
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
      WorkerModel.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .populate("department"),
      WorkerModel.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json<PaginatedResponse<Worker>>({
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
    const worker = await WorkerModel.create(body);

    revalidatePath("/worker");
    return NextResponse.json({ data: worker });
  } catch (error) {
    return NextResponse.json({ error });
  }
}

// colocar admissionDate no form do worker
