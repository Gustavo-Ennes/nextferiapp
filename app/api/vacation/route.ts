import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import type { Vacation } from "@/app/types";
import VacationModel from "@/models/Vacation";
import { revalidatePath } from "next/cache";
import {
  optionsResponse,
  responseWithHeaders,
  updateVacationDates,
} from "../utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const worker = searchParams.get("worker");

    const skip = (page - 1) * limit;
    const typeFilter = type === "all" ? undefined : !type ? "normal" : type;

    const filter = {
      ...(typeFilter && { type: typeFilter }),
      ...(worker && { worker }),
      $or: [{ cancelled: false }, { cancelled: undefined }],
    };

    const [data, totalItems] = await Promise.all([
      VacationModel.find(filter)
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate("worker boss"),
      VacationModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return responseWithHeaders<Vacation>({
      data,
      currentPage: page,
      totalItems,
      totalPages,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    return responseWithHeaders<Vacation>({ error: (error as Error).message });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  try {
    const bodyWithUpdatedDates = updateVacationDates(body);
    const vacation = await VacationModel.create(bodyWithUpdatedDates);
    revalidatePath("/vacation");

    return responseWithHeaders<Vacation>({ data: vacation });
  } catch (error) {
    return responseWithHeaders<Vacation>({ error: (error as Error).message });
  }
}
