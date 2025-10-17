import type { Worker } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { fetchPaginatedByPage } from "../utils";
import { parseBool } from "../components/utils";
import type { RawSearchParams } from "../types";

const WorkerList = async ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => {
  const { page, contains, isExternal, isActive } = await searchParams;
  const isExternalBool = parseBool(isExternal);
  const isActiveBool = parseBool(isActive);
  const paginatedResponse = await fetchPaginatedByPage<Worker>({
    type: "worker",
    params: {
      page: page ? parseInt(page) ?? 1 : 1,
      ...(contains && { contains }),
      ...(isExternal !== undefined && { isExternal: isExternalBool }),
      isActive: isActiveBool ?? true,
    },
  });

  return (
    <ResponsiveListPage<Worker>
      paginatedResponse={paginatedResponse}
      routePrefix="worker"
      contains={contains}
      isExternal={isExternalBool}
    />
  );
};

export default WorkerList;
