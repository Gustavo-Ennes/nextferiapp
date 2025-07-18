import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/database";
import Department from "@/models/Department";

export async function GET() {
  await dbConnect();

  try {
    const departments = await Department.find();
    return NextResponse.json({ success: true, data: departments });
  } catch (error) {
    return NextResponse.json({ error });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  try {
    const department = await Department.create(body, {
      runValidators: true,
    });

    return NextResponse.json({ data: department });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
