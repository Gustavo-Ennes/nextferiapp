import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/database";
import Boss from "@/models/Boss";

export async function GET() {
  await dbConnect();

  try {
    const bosses = await Boss.find();
    return NextResponse.json({ success: true, data: bosses });
  } catch (error) {
    return NextResponse.json({ error });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  try {
    const boss = await Boss.create(body, {
      runValidators: true,
    });

    return NextResponse.json({ data: boss });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
