import { Vacation } from "@/app/types";
import { ResponsiveListPage } from "../../components/ResponsiveListPage";
import { parseVacations } from "../parse";

const DayOffList = async () => {
  const fetchVacations = async () => {
    "use server";
    return fetch(`${process.env.NEXT_PUBLIC_URL}/api/vacation?type=dayOff`);
  };
  const res = await fetchVacations();
  const { data: dayOffs } = await res.json();
  const parsedDayOffs = parseVacations(dayOffs);

  return (
    <ResponsiveListPage<Vacation>
      items={parsedDayOffs ?? []}
      routePrefix="vacation"
      pageTitle="Abonadas"
      vacationType="dayOff"
    />
  );
};

export default DayOffList;
