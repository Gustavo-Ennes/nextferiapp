import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import Department from "@/models/Department";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    const department = await Department.findById(id);
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
    const department = await Department.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
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
    const deleteDepartment = await Department.deleteOne({ _id: id });
    if (!deleteDepartment)
      return NextResponse.json({ error: "Department not found." });

    return NextResponse.json({ success: true, data: deleteDepartment });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
