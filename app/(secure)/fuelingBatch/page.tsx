import type { FuelingBatchTableLine } from "@/dto";
import type { RawSearchParams } from "../types";
import { FuelingBatchRepository } from "@/lib/repository/fuelingBatch/fuelingBatch";
import { ResponsiveListPage } from "../components/ResponsiveListPage";

export default async function FuelingBatchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const { page, snackbarMessage } = await searchParams;

  const paginatedResponse = await FuelingBatchRepository.findTableLines({
    page: page ? (parseInt(page) ?? 1) : 1,
  });

  return (
    <ResponsiveListPage<FuelingBatchTableLine>
      paginatedResponse={paginatedResponse}
      routePrefix="fuelingBatch"
      pageTitle="Resumos de abastecimento"
      snackbarMessage={snackbarMessage}
    />
  );
}
