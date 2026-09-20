import { FuelingBatchRepository } from "@/lib/repository/fuelingBatch/fuelingBatch";
import { FuelingBatchDetail } from "../components/detail/FuelingBatchDetail";
import { redirect } from "next/navigation";

export default async function FuelingBatchDetailServerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fuelingBatch = await FuelingBatchRepository.findById(id);

  if (fuelingBatch) {
    return <FuelingBatchDetail fuelingBatch={fuelingBatch} />;
  }

  return redirect("/not-found");
}
