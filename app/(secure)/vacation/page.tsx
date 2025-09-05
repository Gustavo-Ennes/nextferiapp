import type { Vacation } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { parseVacations } from "./parse";
import { fetchPaginatedByPage } from "../utils";

const VacationList = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: number }>;
}) => {
  const { page } = await searchParams;
  const paginatedResponse = await fetchPaginatedByPage<Vacation>({
    type: "vacation",
    params: { type: "normal", page: page ?? 1 },
  });

  paginatedResponse.data = parseVacations(paginatedResponse.data);

  return (
    <ResponsiveListPage<Vacation>
      paginatedResponse={paginatedResponse}
      routePrefix="vacation"
      pageTitle="Férias"
      vacationType="normal"
    />
  );
};

export default VacationList;
