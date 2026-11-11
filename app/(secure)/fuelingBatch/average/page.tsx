import { FuelingBatchRepository } from "@/lib/repository/fuelingBatch/fuelingBatch";
import { FuelingBatchViewPage } from "./pageClient";

export default async function FuelingBatchServerPage() {
  const fuelingBatches = await FuelingBatchRepository.findWithoutPagination();

  return <FuelingBatchViewPage fuelingBatches={fuelingBatches} />;
}
