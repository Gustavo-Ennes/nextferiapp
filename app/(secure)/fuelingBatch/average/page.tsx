import { FuelingBatchRepository } from "@/lib/repository/fuelingBatch/fuelingBatch";
import { FuelingBatchViewPage } from "./pageClient";

export default async function FuelingBatchServerPage() {
  const { data: fuelingBatches } = await FuelingBatchRepository.find({});

  return <FuelingBatchViewPage fuelingBatches={fuelingBatches} />;
}
