import type { DepartmentDTO, WorkerDTO } from "@/dto";
import { fetchAll } from "../../utils";
import { DepartmentDetail } from "../components/DepartmentDetail";
import { DepartmentRepository } from "@/lib/repository/department/department";
import { WorkerRepository } from "@/lib/repository/worker/worker";
import type { WorkerFormData } from "../../worker/types";
import { redirect } from "next/navigation";

export default async function DepartmentViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const department = await DepartmentRepository.findOne({ id });

  if(!department) redirect("/notFound")

  const workers = await fetchAll<WorkerDTO, WorkerFormData>({
    isActive: true,
    isExternal: false,
    entityType: "worker",
    repository: WorkerRepository,
  });

  const workerQuantity = workers.filter(
    ({ department: workerDepartment }: WorkerDTO) =>
      (department?._id as string) ===
      ((workerDepartment as DepartmentDTO)?._id as string),
  ).length;

  return (
    <DepartmentDetail department={department} workerQuantity={workerQuantity} />
  );
}
