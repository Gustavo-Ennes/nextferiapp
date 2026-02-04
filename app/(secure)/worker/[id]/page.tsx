import type { VacationDTO, WorkerDTO } from "@/dto";
import { fetchAllPaginated, fetchOne } from "../../utils";
import { WorkerDetail } from "../components/WorkerDetail";

export default async function WorkerViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const worker = await fetchOne<WorkerDTO>({ type: "worker", id });
  const workerVacations = await fetchAllPaginated<VacationDTO>({
    params: { worker: worker._id as string, type: "all", cancelled: false },
    type: "vacation",
  });

  return <WorkerDetail worker={worker} workerVacations={workerVacations} />;
}
