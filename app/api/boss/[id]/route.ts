import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Boss from "@/models/Boss";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    const boss = await Boss.findById(id);
    if (!boss) return NextResponse.json({ error: "Boss not found." });

    return NextResponse.json({ success: true, data: boss });
  } catch (error) {
    return NextResponse.json({ error });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const body = await req.json();
  console.log("🚀 ~ PUT ~ body:", body)
  const id = url?.split("/").pop();

  try {
    const boss = await Boss.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!boss) return NextResponse.json({ error: "Boss not found." });

    return NextResponse.json({ data: boss });
  } catch (error) {
    return NextResponse.json({ error });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    const deleteBoss = await Boss.deleteOne({ _id: id });
    if (!deleteBoss) return NextResponse.json({ error: "Boss not found." });

    return NextResponse.json({ success: true, data: deleteBoss });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
