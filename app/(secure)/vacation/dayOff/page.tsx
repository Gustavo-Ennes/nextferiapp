import { ResponsiveListPage } from "../../components/ResponsiveListPage";
import { fetchPaginatedByPage } from "../../utils";
import type { RawSearchParams, SearchParams } from "../../types";
import { parseBool } from "../../components/utils";
import type { VacationDTO } from "@/dto";

const DayOffList = async ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => {
  const { page, contains, cancelled } = await searchParams;
  const cancelledBool = parseBool(cancelled);
  const params: SearchParams = {
    type: "dayOff",
    page: page ? parseInt(page) ?? 1 : 1,
    ...(contains && { contains }),
    cancelled:
      cancelledBool !== null && cancelledBool !== undefined
        ? cancelledBool
        : false,
  };

  const paginatedResponse = await fetchPaginatedByPage<VacationDTO>({
    type: "vacation",
    params,
  });

  return (
    <ResponsiveListPage<VacationDTO>
      paginatedResponse={paginatedResponse}
      routePrefix="vacation"
      pageTitle="Abonadas"
      vacationType="dayOff"
      contains={contains}
    />
  );
};

export default DayOffList;
