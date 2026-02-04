import type { DepartmentDTO, WorkerDTO } from "@/dto";
import { fetchAllPaginated, fetchOne } from "../../utils";
import { DepartmentDetail } from "../components/DepartmentDetail";

export default async function DepartmentViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const department = await fetchOne<DepartmentDTO>({ type: "department", id });
  const workers = await fetchAllPaginated<WorkerDTO>({ type: "worker" });

  const workerQuantity = workers.filter(
    ({ department: workerDepartment }: WorkerDTO) =>
      (department?._id as string) ===
      ((workerDepartment as DepartmentDTO)?._id as string)
  ).length;

  return (
    <DepartmentDetail department={department} workerQuantity={workerQuantity} />
  );
}
