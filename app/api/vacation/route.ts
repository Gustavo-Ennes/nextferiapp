import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import { Vacation } from "@/app/types";
import VacationModel from "@/models/Vacation";
import { startOfDay, endOfDay, addDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { PaginatedResponse } from "../types";
import { updateVacationDates } from "../utils";

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const skip = (page - 1) * limit;

    const filter = {
      type: type ?? "normal",
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

    return NextResponse.json<PaginatedResponse<Vacation>>({
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
    const bodyWithUpdatedDates = updateVacationDates(body);
    const vacation = await VacationModel.create(bodyWithUpdatedDates);
    revalidatePath("/vacation");

    return NextResponse.json({ data: vacation });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
