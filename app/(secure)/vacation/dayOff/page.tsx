import type { Vacation } from "@/app/types";
import { ResponsiveListPage } from "../../components/ResponsiveListPage";
import { parseVacations } from "../parse";
import { fetchPaginatedByPage } from "../../utils";

const DayOffList = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: number }>;
}) => {
  const { page } = await searchParams;
  const paginatedResponse = await fetchPaginatedByPage<Vacation>({
    type: "vacation",
    params: { type: "dayOff", page: page ?? 1 },
  });

  paginatedResponse.data = parseVacations(paginatedResponse.data);

  return (
    <ResponsiveListPage<Vacation>
      paginatedResponse={paginatedResponse}
      routePrefix="vacation"
      pageTitle="Abonadas"
      vacationType="dayOff"
    />
  );
};

export default DayOffList;
