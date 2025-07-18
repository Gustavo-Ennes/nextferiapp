import { Boss } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";

const BossList = async () => {
  const fetchBosses = async () => {
    "use server";
    return fetch(`${process.env.NEXT_PUBLIC_URL}/api/boss`);
  };
  const res = await fetchBosses();
  const { data: bosses } = await res.json();

  return (
    <ResponsiveListPage<Boss>
      items={bosses ?? []}
      routePrefix="boss"
      refetch={fetchBosses}
    />
  );
};

export default BossList;
