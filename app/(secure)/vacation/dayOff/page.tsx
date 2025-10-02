import type { Vacation } from "@/app/types";
import { ResponsiveListPage } from "../../components/ResponsiveListPage";
import { fetchPaginatedByPage } from "../../utils";
import type { SearchParams } from "../../types";

const DayOffList = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: number; contains?: string }>;
}) => {
  const { page, contains } = await searchParams;
  const params: SearchParams = {
    type: "dayOff",
    page: page ?? 1,
    ...(contains && { contains }),
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
