import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/database";
import Department from "@/models/Department";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    const department = await Department.findOne({ _id: id, isActive: true });
    if (!department)
      return NextResponse.json({ error: "Department not found." });

    return NextResponse.json({ success: true, data: department });
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
    const department = await Department.findByIdAndUpdate(id, body);
    if (!department)
      return NextResponse.json({ error: "Department not found." });

    return NextResponse.json({ data: department });
  } catch (error) {
    return NextResponse.json({ error });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    const department = await Department.findByIdAndUpdate(id, {
      isActive: false,
    });
    if (!department)
      return NextResponse.json({ error: "Department not found." });

    return NextResponse.json({ data: department });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
