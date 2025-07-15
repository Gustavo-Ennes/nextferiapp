import { bosses } from "@/app/api/boss/mock";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    return NextResponse.json({ bosses });
  } catch (err) {
    return NextResponse.json({ error: "failed to load data" });
  }
};
