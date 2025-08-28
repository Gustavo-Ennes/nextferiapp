import type { Boss } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";

const BossList = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: number }>;
}) => {
  const { page } = await searchParams;
  const fetchBosses = async () => {
    "use server";
    return fetch(`${process.env.NEXT_PUBLIC_URL}/api/boss?page=${page ?? 1}`);
  };
  const res = await fetchBosses();
  const paginatedResponse = await res.json();

  return (
    <ResponsiveListPage<Boss>
      paginatedResponse={paginatedResponse}
      routePrefix="boss"
    />
  );
};

export default BossList;
