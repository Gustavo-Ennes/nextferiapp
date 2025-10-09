import type { Worker } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { fetchPaginatedByPage } from "../utils";

const WorkerList = async ({
  searchParams,
}: {
  searchParams: Promise<{
    page: number;
    contains?: string;
    isExternal?: boolean;
  }>;
}) => {
  const { page, contains, isExternal } = await searchParams;
  const paginatedResponse = await fetchPaginatedByPage<Worker>({
    type: "worker",
    params: {
      page: page ?? 1,
      ...(contains && { contains }),
      ...(isExternal !== undefined && { isExternal }),
    },
  });

  return (
    <ResponsiveListPage<Worker>
      paginatedResponse={paginatedResponse}
      routePrefix="worker"
      contains={contains}
      isExternal={isExternal}
    />
  );
};

export default WorkerList;
