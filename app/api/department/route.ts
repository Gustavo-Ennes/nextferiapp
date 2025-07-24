import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/database";
import Department from "@/models/Department";

export async function GET() {
  await dbConnect();

  try {
    const departments = await Department.find({ isActive: true });

    const sortedDepartments = departments.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    return NextResponse.json({ success: true, data: sortedDepartments });
  } catch (error) {
    return NextResponse.json({ error });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  try {
    const department = await Department.create(body);

    return NextResponse.json({ data: department });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
