import { Vacation } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";

const VacationList = async () => {
  const res = await fetch(`${process.env.NEXT_API_URL}/vacation`);
  const { vacations } = await res.json();
  return (
    <ResponsiveListPage<Vacation>
      items={vacations ?? []}
      routePrefix="vacation"
    />
  );
};

export default VacationList;
