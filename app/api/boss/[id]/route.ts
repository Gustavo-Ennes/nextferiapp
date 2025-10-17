import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import { optionsResponse, responseWithHeaders } from "../../utils";
import type { Boss } from "@/app/types";
import { BossRepository } from "@/lib/repository/boss";
import { parseBool } from "@/app/(secure)/components/utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();
  const { searchParams } = new URL(url);
  const isActive = parseBool(searchParams.get("isActive"));
  const isExternal = parseBool(searchParams.get("isExternal"));

  try {
    if (!id) throw new Error("No id provided");

    const boss = await BossRepository.findOne({ id, isActive, isExternal });

    if (!boss) throw new Error("Boss not found.");

    return responseWithHeaders<Boss>({ data: boss });
  } catch (error) {
    console.error("BOSS GE[id] ~ error:", error);
    return responseWithHeaders<Boss>({ error: (error as Error).message });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const payload = await req.json();
  const id = url?.split("/").pop();

  try {
    if (!id) throw new Error("No id provided");

    const boss = await BossRepository.update({ id, payload });

    if (!boss) throw new Error("Boss not found.");

    return responseWithHeaders<Boss>({ data: boss });
  } catch (error) {
    console.error("BOSS POST ~ error:", error);
    return responseWithHeaders<Boss>({ error: (error as Error).message });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    if (!id) throw new Error("No id provided");

    const boss = await BossRepository.delete(id);

    if (!boss) throw new Error("Boss not found.");

    return responseWithHeaders<Boss>({ data: boss });
  } catch (error) {
    console.error("BOSS DELETE ~ error:", error);
    return responseWithHeaders<Boss>({ error: (error as Error).message });
  }
}
