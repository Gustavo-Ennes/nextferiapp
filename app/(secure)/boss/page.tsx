import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { fetchPaginatedByPage } from "../utils";
import { parseBool } from "../components/utils";
import type { RawSearchParams } from "../types";
import type { BossDTO } from "@/dto";

const BossList = async ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => {
  const { page, contains, isExternal, isActive } = await searchParams;
  const isExternalBool = parseBool(isExternal);
  const isActiveBool = parseBool(isActive);
  const paginatedResponse = await fetchPaginatedByPage<BossDTO>({
    type: "boss",
    params: {
      page: page ? parseInt(page) : 1,
      ...(contains && { contains }),
      ...(isExternal !== undefined &&
        isExternal !== null && { isExternal: isExternalBool }),
      isActive: isActiveBool ?? true,
    },
  });

  return (
    <ResponsiveListPage<BossDTO>
      paginatedResponse={paginatedResponse}
      routePrefix="boss"
      contains={contains}
      isExternal={isExternalBool}
    />
  );
};

export default BossList;
