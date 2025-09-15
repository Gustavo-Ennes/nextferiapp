import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/database";
import WorkerModel from "@/models/Worker";
import type { Worker } from "@/app/types";
import { revalidatePath } from "next/cache";
import { optionsResponse, responseWithHeaders } from "../../utils";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    const worker = await WorkerModel.findOne({
      _id: id,
      isActive: true,
    }).populate("department");
    if (!worker)
      return responseWithHeaders<Worker>({ error: "Worker not found." });

    return responseWithHeaders<Worker>({ data: worker });
  } catch (error) {
    return responseWithHeaders<Worker>({ error: (error as Error).message });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const body = await req.json();
  const id = url?.split("/").pop();

  try {
    const worker = await WorkerModel.findByIdAndUpdate(id, body);
    if (!worker)
      return responseWithHeaders<Worker>({ error: "Worker not found." });

    revalidatePath("/worker");
    return responseWithHeaders<Worker>({ data: worker });
  } catch (error) {
    return responseWithHeaders<Worker>({ error: (error as Error).message });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { url } = req;
  const id = url?.split("/").pop();

  try {
    const worker = await WorkerModel.findByIdAndUpdate(id, { isActive: false });
    if (!worker)
      return responseWithHeaders<Worker>({ error: "Worker not found." });

    revalidatePath("/worker");
    return responseWithHeaders<Worker>({ data: worker });
  } catch (error) {
    return responseWithHeaders<Worker>({ error: (error as Error).message });
  }
}
