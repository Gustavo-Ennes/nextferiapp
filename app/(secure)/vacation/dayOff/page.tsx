import type { Vacation } from "@/app/types";
import { ResponsiveListPage } from "../../components/ResponsiveListPage";
import { parseVacations } from "../parse";

const DayOffList = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: number }>;
}) => {
  const { page } = await searchParams;
  const fetchVacations = async () => {
    return fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/vacation?type=dayOff&page=${
        page ?? 1
      }`
    );
  };
  const res = await fetchVacations();
  const paginatedResponse = await res.json();
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
