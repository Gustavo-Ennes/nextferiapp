import { vacations } from "@/app/(secure)/vacation/mock";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const vacation = vacations.find((vacation) => vacation._id === req.url.split("/").pop());
    return NextResponse.json({ vacation });
  } catch (err) {
    return NextResponse.json({ error: "failed to load data" });
  }
};
