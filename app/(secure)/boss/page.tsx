import type { Boss } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { fetchPaginatedByPage } from "../utils";
import { parseBool } from "../components/utils";
import type { RawSearchParams } from "../types";

const BossList = async ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => {
  const { page, contains, isExternal, isActive } = await searchParams;
  const isExternalBool = parseBool(isExternal);
  const isActiveBool = parseBool(isActive);
  const paginatedResponse = await fetchPaginatedByPage<Boss>({
    type: "boss",
    params: {
      page: page ? parseInt(page) : 1,
      ...(contains && { contains }),
      ...(isExternal !== undefined && { isExternal: isExternalBool }),
      isActive: isActiveBool ?? true,
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
