import { BossRepository } from "@/lib/repository/boss/boss";
import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { parseBool } from "../components/utils";
import type { RawSearchParams } from "../types";
import type { WorkerDTO } from "@/dto";
import { WorkerRepository } from "@/lib/repository/worker/worker";
import { DepartmentRepository } from "@/lib/repository/department/department";
import { getWorkersInCharge } from "../utils";

const WorkerList = async ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => {
  const { page, contains, isExternal, isActive } = await searchParams;
  const isExternalBool = parseBool(isExternal);
  const isActiveBool = parseBool(isActive);

  const paginatedResponse = await WorkerRepository.find({
    page: page ? (parseInt(page) ?? 1) : 1,
    ...(contains && { contains }),
    ...(isExternal !== undefined && { isExternal: isExternalBool }),
    isActive: isActiveBool ?? true,
  });
  const bosses = await BossRepository.findWithoutPagination!({
    isActive: true,
  });
  const departments = await DepartmentRepository.findWithoutPagination!({
    isActive: true,
  });
  const workersInChargeWarnings = getWorkersInCharge({ bosses, departments });

  return (
    <ResponsiveListPage<WorkerDTO>
      paginatedResponse={paginatedResponse}
      routePrefix="worker"
      contains={contains}
      isExternal={isExternalBool}
      rowFlags={workersInChargeWarnings}
    />
  );
};

export default WorkerList;
