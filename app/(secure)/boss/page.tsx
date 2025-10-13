import type { Boss } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { fetchPaginatedByPage } from "../utils";
import { parseBool } from "../components/utils";

const BossList = async ({
  searchParams,
}: {
  searchParams: Promise<{
    page: number;
    contains?: string;
    isExternal?: string;
  }>;
}) => {
  const { page, contains, isExternal } = await searchParams;
  const isExternalBool = parseBool(isExternal);
  const paginatedResponse = await fetchPaginatedByPage<Boss>({
    type: "boss",
    params: {
      page: page ?? 1,
      ...(contains && { contains }),
      ...(isExternal !== undefined && { isExternal: isExternalBool }),
    },
  });

  return (
    <ResponsiveListPage<Boss>
      paginatedResponse={paginatedResponse}
      routePrefix="boss"
      contains={contains}
      isExternal={isExternalBool}
    />
  );
};

export default BossList;
