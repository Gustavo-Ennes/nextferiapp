import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/database";
import DepartmentModel from "@/models/Department";
import { Department } from "@/app/types";
import { PaginatedResponse } from "../types";

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
      DepartmentModel.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      DepartmentModel.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json<PaginatedResponse<Department>>({
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
    const department = await DepartmentModel.create(body);

    return NextResponse.json({ data: department });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
