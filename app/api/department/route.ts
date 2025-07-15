import { departments } from "@/app/api/department/mock";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    return NextResponse.json({ departments });
  } catch (err) {
    return NextResponse.json({ error: "failed to load data" });
  }
};
