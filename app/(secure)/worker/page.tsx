import { Worker } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";

const WorkerList = async () => {
  const fetchWorkers = async () => {
    "use server";
    return fetch(`${process.env.NEXT_PUBLIC_URL}/api/worker`);
  };
  const res = await fetchWorkers();
  const { data: workers } = await res.json();

  return (
    <ResponsiveListPage<Worker> items={workers ?? []} routePrefix="worker" />
  );
};

export default WorkerList;
