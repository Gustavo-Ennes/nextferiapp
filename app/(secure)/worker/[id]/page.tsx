import type { VacationDTO } from "@/dto";
import { WorkerDetail } from "../components/WorkerDetail";
import { WorkerRepository } from "@/lib/repository/worker/worker";
import { fetchAll } from "../../utils";
import type { VacationFormData } from "../../vacation/types";
import { VacationRepository } from "@/lib/repository/vacation/vacation";
import { redirect } from "next/navigation";

export default async function WorkerViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const worker = await WorkerRepository.findOne({ id });

  if (!worker) redirect("/notFound");

  const workerVacations = await fetchAll<VacationDTO, VacationFormData>({
    worker: worker._id,
    type: "all",
    cancelled: false,
    entityType: "worker",
    repository: VacationRepository,
  });

  return <WorkerDetail worker={worker} workerVacations={workerVacations} />;
}
