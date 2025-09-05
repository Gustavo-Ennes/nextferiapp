import type { Worker } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { fetchPaginatedByPage } from "../utils";

const WorkerList = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: number }>;
}) => {
  const { page } = await searchParams;
  const paginatedResponse = await fetchPaginatedByPage<Worker>({
    type: "worker",
    params: { page: page ?? 1 },
  });

  return (
    <ResponsiveListPage<Worker>
      paginatedResponse={paginatedResponse}
      routePrefix="worker"
    />
  );
};

export default WorkerList;
