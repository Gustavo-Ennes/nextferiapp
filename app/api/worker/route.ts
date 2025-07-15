import { workers } from "@/app/api/worker/mock";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    return NextResponse.json({ workers });
  } catch (err) {
    return NextResponse.json({ error: "failed to load data" });
  }
};
