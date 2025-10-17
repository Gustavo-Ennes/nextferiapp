import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import type { Vacation } from "@/app/types";
import { revalidatePath } from "next/cache";
import {
  optionsResponse,
  responseWithHeaders,
  updateVacationDates,
} from "../../utils";
import { parseBool } from "@/app/(secure)/components/utils";
import { VacationRepository } from "@/lib/repository/vacation";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop()?.split("?")[0];
  const searchParams = req.nextUrl.searchParams;
  const cancelled = parseBool(searchParams.get("cancelled")) ?? false;

  try {
    if (!id) throw new Error("No id provided");

    const vacation = await VacationRepository.findOne({ id, cancelled });

    if (!vacation) throw new Error("Vacation not found.");

    return responseWithHeaders<Vacation>({ data: vacation });
  } catch (error) {
    console.error("VACATION[id] GET ~ error:", error);
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
    if (!id) throw new Error("No id provided");

    const payload = updateVacationDates(body);
    const vacation = await VacationRepository.update({ id, payload });

    if (!vacation) throw new Error("Vacation not found.");

    return responseWithHeaders<Vacation>({ data: vacation });
  } catch (error) {
    console.error("VACATION PUT ~ error:", error);
    return responseWithHeaders<Vacation>({ error: (error as Error).message });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    if (!id) throw new Error("No id provided");

    const vacation = await VacationRepository.delete(id);

    if (!vacation) throw new Error("Vacation not found.");

    return responseWithHeaders<Vacation>({ data: vacation });
  } catch (error) {
    console.error("VACATION DELETE ~ error:", error);
    return responseWithHeaders<Vacation>({ error: (error as Error).message });
  }
}
