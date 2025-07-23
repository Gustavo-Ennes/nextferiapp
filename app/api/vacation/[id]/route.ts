import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Vacation from "@/models/Vacation";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    const vacation = await Vacation.findById(id)
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
    const vacation = await Vacation.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

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
    const deleteVacation = await Vacation.deleteOne({ _id: id });
    if (!deleteVacation)
      return NextResponse.json({ error: "Vacation not found." });


    revalidatePath("/vacation");
    return NextResponse.json({ success: true, data: deleteVacation });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
