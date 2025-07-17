import { Vacation } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";

const VacationList = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/vacation`);
  const { vacations } = await res.json();
  return (
    <ResponsiveListPage<Vacation>
      items={vacations ?? []}
      routePrefix="vacation"
      onConfirmDelete={() => undefined}
      refetch={() => undefined}
    />
  );
};

export default VacationList;
