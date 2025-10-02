import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import DepartmentModel from "@/models/Department";
import type { Department } from "@/app/types";
import { optionsResponse, responseWithHeaders } from "../utils";
import type { AggregatedDepartment, FacetResult } from "../types";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const contains = searchParams.get("contains");

    const skip = (page - 1) * limit;

    const filter = {
      isActive: true,
    };
    const pipeline = [];

    pipeline.push({ $match: filter });

    pipeline.push({
      $lookup: {
        from: "bosses",
        localField: "responsible",
        foreignField: "_id",
        as: "responsibleData",
      },
    });
    pipeline.push({ $unwind: "$responsibleData" });

    pipeline.push({
      $lookup: {
        from: "workers",
        localField: "responsibleData.worker",
        foreignField: "_id",
        as: "workerData",
      },
    });
    pipeline.push({ $unwind: "$workerData" });

    if (contains) {
      const regex = new RegExp(contains, "i");
      pipeline.push({
        $match: {
          $or: [
            { "workerData.name": { $regex: regex } },
            { name: { $regex: regex } },
          ],
        },
      });
    }

    pipeline.push({ $sort: { name: 1 as 1 } });

    const [aggregationResult] = await DepartmentModel.aggregate<
      FacetResult<AggregatedDepartment>
    >([
      ...pipeline,
      {
        $facet: {
          totalItems: [{ $count: "count" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);

    const totalItems = aggregationResult.totalItems[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const rawData = aggregationResult.data;

    const data = rawData.map((doc) => ({
      ...doc,
      responsible: {
        ...doc.responsibleData,
        worker: doc.workerData,
      },
    }));

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
