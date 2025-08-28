import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/database";
import Vacation from "@/models/Vacation";
import { revalidatePath } from "next/cache";
import { updateVacationDates } from "../../utils";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop()?.split('?')[0];
  const searchParams = req.nextUrl.searchParams;
  const cancelled = Boolean(searchParams.get("cancelled")) ?? false;

  try {
    const vacation = await Vacation.findOne({
      _id: id,
      ...(!cancelled && {
        $or: [{ cancelled: false }, { cancelled: undefined }],
      }),
    })
      .populate("worker")
      .populate("boss");

    if (!vacation) return NextResponse.json({ error: "Vacation not found." });

    return NextResponse.json({ success: true, data: vacation });
  } catch (error) {
    return NextResponse.json({ error });
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
    const vacation = await Vacation.findByIdAndUpdate(id, bodyWithUpdatedDates);

    if (!vacation) return NextResponse.json({ error: "Vacation not found." });

    return NextResponse.json({ data: vacation });
  } catch (error) {
    return NextResponse.json({ error });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    const vacation = await Vacation.findByIdAndUpdate(id, { cancelled: true });

    if (!vacation) return NextResponse.json({ error: "Vacation not found." });

    return NextResponse.json({ data: vacation });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
