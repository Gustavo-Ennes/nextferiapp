import { NextRequest } from "next/server";
import { genericResponseWithHeaders, optionsResponse } from "../../utils";
import { FuelingBatchRepository } from "@/lib/repository/fuelingBatch/fuelingBatch";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(req: NextRequest) {
  const { url } = req;
  const id = url?.split("/").pop()?.split("?")[0];
  try {
    if (!id) throw new Error("No id provided");

    const fuelingBatch = await FuelingBatchRepository.findById(id);

    if (!fuelingBatch) throw new Error("No fueling batch found for this id.");

    return genericResponseWithHeaders({ data: fuelingBatch });
  } catch (error) {
    console.error("FUELLING BATCH GET[id] ~ error:", error);
    return genericResponseWithHeaders({
      error: (error as Error).message,
    });
  }
}

export async function DELETE(req: NextRequest) {
  const { url } = req;
  const id = url?.split("/").pop();

  if (!id) throw new Error("No id provided.");

  await FuelingBatchRepository.delete(id);

  return genericResponseWithHeaders({ data: { success: true } });
}

export async function PUT(req: NextRequest) {
  const { url } = req;
  const body = await req.json();
  const payload = body.payload;
  const id = url?.split("/").pop();
  try {
    if (!id) throw new Error("No id provided");

    const updatedFuelingBatch = await FuelingBatchRepository.update(payload);

    return genericResponseWithHeaders({ data: updatedFuelingBatch });
  } catch (error) {
    console.error("FUELLING BATCH GET[id] ~ error:", error);
    return genericResponseWithHeaders({
      error: (error as Error).message,
    });
  }
}
