import { departments } from "@/app/api/department/mock";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const department = departments.find(
      (department) => department._id === req.url.split("/").pop()
    );
    return NextResponse.json({ department });
  } catch (err) {
    return NextResponse.json({ error: "failed to load data" });
  }
};
