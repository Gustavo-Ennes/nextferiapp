import type { Vacation, Worker } from "@/app/types";
import { fetchAllPaginated, fetchOne } from "../../utils";
import { WorkerDetail } from "../components/WorkerDetail";

export default async function WorkerViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const worker = await fetchOne<Worker>({ type: "worker", id });
  const workerVacations = await fetchAllPaginated<Vacation>({
    params: { worker: worker._id as string, type: "all" },
    type: "vacation",
  });

  return <WorkerDetail worker={worker} workerVacations={workerVacations} />;
}
