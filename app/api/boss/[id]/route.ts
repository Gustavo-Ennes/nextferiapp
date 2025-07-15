import { bosses } from "@/app/api/boss/mock";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const boss = bosses.find((boss) => boss._id === req.url.split("/").pop());
    return NextResponse.json({ boss });
  } catch (err) {
    return NextResponse.json({ error: "failed to load data" });
  }
};
