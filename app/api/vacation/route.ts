import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/database";
import Vacation from "@/models/Vacation";
import { startOfDay, endOfDay, addDays } from "date-fns";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const vacations = await Vacation.find({
      type: type ?? "vacation",
      $or: [{ cancelled: false }, { cancelled: undefined }],
    })
      .populate("boss")
      .populate("worker")
      .sort({ startDate: "desc" });

    return NextResponse.json({ success: true, data: vacations });
  } catch (error) {
    return NextResponse.json({ error });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  body.startDate = startOfDay(new Date(body.startDate)).toISOString();
  body.endDate = endOfDay(
    addDays(new Date(body.startDate), (body.duration ?? body.daysQtd) - 1)
  ).toISOString();

  try {
    const vacation = await Vacation.create(body);
    revalidatePath("/vacation");

    return NextResponse.json({ data: vacation });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
