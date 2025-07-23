import { Vacation } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";
import { parseVacations } from "./parse";

const VacationList = async () => {
  const fetchVacations = async () => {
    "use server";
    return fetch(`${process.env.NEXT_PUBLIC_URL}/api/vacation`);
  };
  const res = await fetchVacations();
  const { data: vacations } = await res.json();
  const parsedVacations = parseVacations(vacations);

  return (
    <ResponsiveListPage<Vacation>
      items={parsedVacations ?? []}
      routePrefix="vacation"
    />
  );
};

export default VacationList;
