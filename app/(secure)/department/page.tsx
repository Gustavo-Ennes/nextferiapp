import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { parseBool } from "../components/utils";
import type { RawSearchParams } from "../types";
import type { DepartmentDTO } from "@/dto";
import { DepartmentRepository } from "@/lib/repository/department/department";

const DepartmentList = async ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => {
  const { page, contains, isActive } = await searchParams;
  const isActiveBool = parseBool(isActive);

  const paginatedResponse = await DepartmentRepository.find({
    page: page ? (parseInt(page) ?? 1) : 1,
    ...(contains && { contains }),
    isActive: isActiveBool ?? true,
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
