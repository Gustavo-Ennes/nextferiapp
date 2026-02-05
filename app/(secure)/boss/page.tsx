import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { parseBool } from "../components/utils";
import type { RawSearchParams } from "../types";
import type { BossDTO } from "@/dto";
import { BossRepository } from "@/lib/repository/boss/boss";

const BossList = async ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => {
  const { page, contains, isExternal, isActive } = await searchParams;
  const isExternalBool = parseBool(isExternal);
  const isActiveBool = parseBool(isActive);
  
  const paginatedResponse = await BossRepository.find({
    page: page ? parseInt(page) : 1,
    ...(contains && { contains }),
    ...(isExternal !== undefined &&
      isExternal !== null && { isExternal: isExternalBool }),
    isActive: isActiveBool ?? true,
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
