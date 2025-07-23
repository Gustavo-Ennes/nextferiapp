import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Worker from "@/models/Worker";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    const worker = await Worker.findById(id).populate("department");
    if (!worker) return NextResponse.json({ error: "Worker not found." });

    return NextResponse.json({ success: true, data: worker });
  } catch (error) {
    return NextResponse.json({ error });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const body = await req.json();
  const id = url?.split("/").pop();

  try {
    const worker = await Worker.findByIdAndUpdate(id, body);
    if (!worker) return NextResponse.json({ error: "Worker not found." });

    revalidatePath("/worker");
    return NextResponse.json({ data: worker });
  } catch (error) {
    return NextResponse.json({ error });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    const deleteWorker = await Worker.deleteOne({ _id: id });
    if (!deleteWorker) return NextResponse.json({ error: "Worker not found." });

    revalidatePath("/worker");
    return NextResponse.json({ success: true, data: deleteWorker });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
