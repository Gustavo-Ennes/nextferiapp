import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { parseBool } from "../components/utils";
import type { RawSearchParams } from "../types";
import type { WorkerDTO } from "@/dto";
import { WorkerRepository } from "@/lib/repository/worker/worker";

const WorkerList = async ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => {
  const { page, contains, isExternal, isActive } = await searchParams;
  const isExternalBool = parseBool(isExternal);
  const isActiveBool = parseBool(isActive);

  const paginatedResponse = await WorkerRepository.find({
    page: page ? (parseInt(page) ?? 1) : 1,
    ...(contains && { contains }),
    ...(isExternal !== undefined && { isExternal: isExternalBool }),
    isActive: isActiveBool ?? true,
  });

  return (
    <ResponsiveListPage<WorkerDTO>
      paginatedResponse={paginatedResponse}
      routePrefix="worker"
      contains={contains}
      isExternal={isExternalBool}
    />
  );
};

export default WorkerList;
