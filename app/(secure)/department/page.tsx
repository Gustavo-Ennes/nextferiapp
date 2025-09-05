import type { Department } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { fetchPaginatedByPage } from "../utils";

const DepartmentList = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: number }>;
}) => {
  const { page } = await searchParams;
  const paginatedResponse = await fetchPaginatedByPage<Department>({
    type: "department",
    params: { page: page ?? 1 },
  });

  return (
    <ResponsiveListPage<Department>
      paginatedResponse={paginatedResponse}
      routePrefix="department"
    />
  );
};

export default DepartmentList;
