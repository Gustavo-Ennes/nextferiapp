import { Vacation } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { parseVacations } from "./parse";

const VacationList = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: number }>;
}) => {
  const { page } = await searchParams;
  const fetchVacations = async () => {
    "use server";
    return fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/vacation?page=${page ?? 1}`
    );
  };
  const res = await fetchVacations();
  const paginatedResponse = await res.json();
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
