import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import DepartmentModel from "@/models/Department";
import type { Department } from "@/app/types";
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
      DepartmentModel.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "responsible",
          populate: {
            path: "worker",
          },
        }),
      DepartmentModel.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(totalItems / limit);

    return responseWithHeaders<Department>({
      data,
      currentPage: page,
      totalItems,
      totalPages,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    return responseWithHeaders<Department>({ error: (error as Error).message });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  try {
    const department = await DepartmentModel.create(body);

    return responseWithHeaders<Department>({ data: department });
  } catch (error) {
    return responseWithHeaders<Department>({ error: (error as Error).message });
  }
}
