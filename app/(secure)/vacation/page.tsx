import { ResponsiveListPage } from "../components/ResponsiveListPage";
import type { RawSearchParams, SearchParams } from "../types";
import { parseBool } from "../components/utils";
import type { VacationDTO } from "@/dto";
import { VacationRepository } from "@/lib/repository/vacation/vacation";

const VacationList = async ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => {
  const { page, contains, cancelled } = await searchParams;
  const cancelledBool = parseBool(cancelled);
  const params: SearchParams = {
    type: "normal",
    page: page ? parseInt(page) ?? 1 : 1,
    ...(contains && { contains }),
    cancelled:
      cancelledBool !== null && cancelledBool !== undefined
        ? cancelledBool
        : false,
  };
  const paginatedResponse = await VacationRepository.find(params)

  return (
    <ResponsiveListPage<VacationDTO>
      paginatedResponse={paginatedResponse}
      routePrefix="vacation"
      pageTitle="Férias"
      vacationType="normal"
      contains={contains}
    />
  );
};

export default VacationList;
