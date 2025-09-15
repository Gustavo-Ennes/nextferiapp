import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import BossModel from "@/models/Boss";
import { optionsResponse, responseWithHeaders } from "../../utils";
import type { Boss } from "@/app/types";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    const boss = await BossModel.findOne({ _id: id, isActive: true }).populate(
      "worker"
    );
    if (!boss) return responseWithHeaders<Boss>({ error: "Boss not found." });

    return responseWithHeaders<Boss>({ data: boss });
  } catch (error) {
    return responseWithHeaders<Boss>({ error: (error as Error).message });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const body = await req.json();
  const id = url?.split("/").pop();

  try {
    const boss = await BossModel.findByIdAndUpdate(id, body);
    if (!boss) return responseWithHeaders<Boss>({ error: "Boss not found." });

    return responseWithHeaders<Boss>({ data: boss });
  } catch (error) {
    return responseWithHeaders<Boss>({ error: (error as Error).message });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    const boss = await BossModel.findByIdAndUpdate(id, { isActive: false });
    if (!boss) return responseWithHeaders<Boss>({ error: "Boss not found." });

    return responseWithHeaders<Boss>({ data: boss });
  } catch (error) {
    return responseWithHeaders<Boss>({ error: (error as Error).message });
  }
}
