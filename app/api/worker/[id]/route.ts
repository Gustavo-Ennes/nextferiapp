import { workers } from "@/app/api/worker/mock";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const worker = workers.find(
      (worker) => worker._id === req.url.split("/").pop()
    );
    return NextResponse.json({ worker });
  } catch (err) {
    return NextResponse.json({ error: "failed to load data" });
  }
};
