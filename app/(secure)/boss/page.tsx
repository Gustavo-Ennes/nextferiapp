import type { Boss } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { fetchPaginatedByPage } from "../utils";

const BossList = async ({
  searchParams,
}: {
  searchParams: Promise<{
    page: number;
    contains?: string;
    isExternal?: boolean;
  }>;
}) => {
  const { page, contains, isExternal } = await searchParams;
  const paginatedResponse = await fetchPaginatedByPage<Boss>({
    type: "boss",
    params: {
      page: page ?? 1,
      ...(contains && { contains }),
      ...(isExternal !== undefined && { isExternal }),
    },
  });

  return (
    <ResponsiveListPage<Boss>
      paginatedResponse={paginatedResponse}
      routePrefix="boss"
      contains={contains}
    />
  );
};

export default BossList;
