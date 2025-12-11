import type { Vacation } from "@/app/types";
import { ResponsiveListPage } from "../../components/ResponsiveListPage";
import { fetchPaginatedByPage } from "../../utils";
import type { RawSearchParams, SearchParams } from "../../types";
import { parseBool } from "../../components/utils";

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

  const paginatedResponse = await fetchPaginatedByPage<Vacation>({
    type: "vacation",
    params,
  });

  return (
    <ResponsiveListPage<Vacation>
      paginatedResponse={paginatedResponse}
      routePrefix="vacation"
      pageTitle="Abonadas"
      vacationType="dayOff"
      contains={contains}
    />
  );
};

export default DayOffList;
