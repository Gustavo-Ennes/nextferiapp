import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import type { Worker } from "@/app/types";
import { revalidatePath } from "next/cache";
import { optionsResponse, responseWithHeaders } from "../../utils";
import { WorkerRepository } from "@/lib/repository/worker";
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
    if (!id) throw new Error("No id provided.");

    const worker = await WorkerRepository.findOne({ id, isActive, isExternal });

    if (!worker) throw new Error("Worker not found.");

    return responseWithHeaders<Worker>({ data: worker });
  } catch (error) {
    console.error("WORKER GET[id] ~ error:", error);
    return responseWithHeaders<Worker>({ error: (error as Error).message });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const payload = await req.json();
  const id = url?.split("/").pop();

  try {
    if (!id) throw new Error("No id provided.");

    const worker = await WorkerRepository.update({ id, payload });

    if (!worker) throw new Error("Worker not found.");

    revalidatePath("/worker");
    return responseWithHeaders<Worker>({ data: worker });
  } catch (error) {
    console.error("WORKER PUT ~ error:", error);
    return responseWithHeaders<Worker>({ error: (error as Error).message });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    if (!id) throw new Error("No id provided.");

    const worker = await WorkerRepository.delete(id);

    if (!worker) throw new Error("Worker not found.");

    revalidatePath("/worker");
    return responseWithHeaders<Worker>({ data: worker });
  } catch (error) {
    console.error("WORKER DELETE ~ error:", error);
    return responseWithHeaders<Worker>({ error: (error as Error).message });
  }
}
