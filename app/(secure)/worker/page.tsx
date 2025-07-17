import { Worker } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";

const WorkerList = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/worker`);
  const { workers } = await res.json();
  return (
    <ResponsiveListPage<Worker>
      items={workers ?? []}
      routePrefix="worker"
      onConfirmDelete={() => undefined}
      refetch={() => undefined}
    />
  );
};

export default WorkerList;
