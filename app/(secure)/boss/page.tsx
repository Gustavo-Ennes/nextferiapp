import { Boss } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";

const BossList = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/boss`);
  const { bosses } = await res.json();
  return <ResponsiveListPage<Boss> items={bosses ?? []} routePrefix="boss" />;
};

export default BossList;
