import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/database";
import Boss from "@/models/Boss";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    const boss = await Boss.findOne({ _id: id, isActive: true }).populate(
      "worker"
    );
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
  const id = url?.split("/").pop();

  try {
    const boss = await Boss.findByIdAndUpdate(id, body);
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
    const boss = await Boss.findByIdAndUpdate(id, { isActive: false });
    if (!boss) return NextResponse.json({ error: "Boss not found." });

    return NextResponse.json({ data: boss });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
