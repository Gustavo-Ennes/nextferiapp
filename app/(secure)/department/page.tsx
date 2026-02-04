import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { fetchPaginatedByPage } from "../utils";
import { parseBool } from "../components/utils";
import type { RawSearchParams } from "../types";
import type { DepartmentDTO } from "@/dto";

const DepartmentList = async ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => {
  const { page, contains, isActive } = await searchParams;
  const isActiveBool = parseBool(isActive);
  const paginatedResponse = await fetchPaginatedByPage<DepartmentDTO>({
    type: "department",
    params: {
      page: page ? parseInt(page) ?? 1 : 1,
      ...(contains && { contains }),
      isActive: isActiveBool ?? true,
    },
  });

  return (
    <ResponsiveListPage<DepartmentDTO>
      paginatedResponse={paginatedResponse}
      routePrefix="department"
      contains={contains}
    />
  );
};

export default DepartmentList;
