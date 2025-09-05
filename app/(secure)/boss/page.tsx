import type { Boss } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { fetchPaginatedByPage } from "../utils";

const BossList = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: number }>;
}) => {
  const { page } = await searchParams;
  const paginatedResponse = await fetchPaginatedByPage<Boss>({
    type: "boss",
    params: { page: page ?? 1 },
  });

  return (
    <ResponsiveListPage<Boss>
      paginatedResponse={paginatedResponse}
      routePrefix="boss"
    />
  );
};

export default BossList;
