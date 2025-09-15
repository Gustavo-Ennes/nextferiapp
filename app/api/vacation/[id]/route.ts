import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import VacationModel from "@/models/Vacation";
import type { Vacation } from "@/app/types";
import { revalidatePath } from "next/cache";
import {
  optionsResponse,
  responseWithHeaders,
  updateVacationDates,
} from "../../utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop()?.split("?")[0];
  const searchParams = req.nextUrl.searchParams;
  const cancelled = Boolean(searchParams.get("cancelled")) ?? false;

  try {
    const vacation = await VacationModel.findOne({
      _id: id,
      ...(!cancelled && {
        $or: [{ cancelled: false }, { cancelled: undefined }],
      }),
    })
      .populate("worker")
      .populate("boss");

    if (!vacation)
      return responseWithHeaders<Vacation>({ error: "Vacation not found." });

    return responseWithHeaders<Vacation>({ data: vacation });
  } catch (error) {
    return responseWithHeaders<Vacation>({ error: (error as Error).message });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const body = await req.json();
  const id = url?.split("/").pop();
  body.daysQtd = body.duration;

  revalidatePath("/vacation");

  try {
    const bodyWithUpdatedDates = updateVacationDates(body);
    const vacation = await VacationModel.findByIdAndUpdate(
      id,
      bodyWithUpdatedDates
    );

    if (!vacation)
      return responseWithHeaders<Vacation>({ error: "Vacation not found." });

    return responseWithHeaders<Vacation>({ data: vacation });
  } catch (error) {
    return responseWithHeaders<Vacation>({ error: (error as Error).message });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    const vacation = await VacationModel.findByIdAndUpdate(id, {
      cancelled: true,
    });

    if (!vacation)
      return responseWithHeaders<Vacation>({ error: "Vacation not found." });

    return responseWithHeaders<Vacation>({ data: vacation });
  } catch (error) {
    return responseWithHeaders<Vacation>({ error: (error as Error).message });
  }
}
