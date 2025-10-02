import type { Department } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { fetchPaginatedByPage } from "../utils";

const DepartmentList = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: number; contains?: string }>;
}) => {
  const { page, contains } = await searchParams;
  const paginatedResponse = await fetchPaginatedByPage<Department>({
    type: "department",
    params: { page: page ?? 1, ...(contains && { contains }) },
  });

  return (
    <ResponsiveListPage<Department>
      paginatedResponse={paginatedResponse}
      routePrefix="department"
      contains={contains}
    />
  );
};

export default DepartmentList;
