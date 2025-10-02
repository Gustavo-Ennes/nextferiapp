import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import BossModel from "@/models/Boss";
import type { Boss } from "@/app/types";
import { optionsResponse, responseWithHeaders } from "../utils";
import type { AggregatedBoss, FacetResult } from "../types";

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
        from: "workers",
        localField: "worker",
        foreignField: "_id",
        as: "workerData",
      },
    });

    pipeline.push({ $unwind: "$workerData" });

    if (contains) {
      const regex = new RegExp(contains, "i");
      pipeline.push({
        $match: {
          "workerData.name": { $regex: regex },
        },
      });
    }
    pipeline.push({ $sort: { name: 1 as 1 } });

    const [aggregationResult] = await BossModel.aggregate<
      FacetResult<AggregatedBoss>
    >([
      ...pipeline,
      {
        $facet: {
          totalItems: [{ $count: "count" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]).exec();

    const totalItems = aggregationResult.totalItems[0]?.count || 0;
    const rawData = aggregationResult.data;

    const data = rawData.map((doc: AggregatedBoss) => ({
      ...doc,
      worker: doc.workerData,
    }));

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
