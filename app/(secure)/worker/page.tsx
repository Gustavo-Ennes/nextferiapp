import type { Worker } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";

const WorkerList = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: number }>;
}) => {
  const { page } = await searchParams;
  const fetchWorkers = async () => {
    "use server";
    return fetch(`${process.env.NEXT_PUBLIC_URL}/api/worker?page=${page ?? 1}`);
  };
  const res = await fetchWorkers();
  const paginatedResponse = await res.json();

  return (
    <ResponsiveListPage<Worker>
      paginatedResponse={paginatedResponse}
      routePrefix="worker"
    />
  );
};

export default WorkerList;
