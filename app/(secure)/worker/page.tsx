import type { Worker } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { fetchPaginatedByPage } from "../utils";
import { parseBool } from "../components/utils";

const WorkerList = async ({
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
  const paginatedResponse = await fetchPaginatedByPage<Worker>({
    type: "worker",
    params: {
      page: page ?? 1,
      isActive: true,
      ...(contains && { contains }),
      ...(isExternal !== undefined && { isExternal: isExternalBool }),
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
