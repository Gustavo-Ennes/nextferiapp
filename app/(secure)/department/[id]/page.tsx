import { fetchAllPaginated, fetchOne } from "../../utils";
import { DepartmentDetail } from "../components/DepartmentDetail";
import type { Department, Worker } from "@/app/types";

export default async function DepartmentViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const department = await fetchOne<Department>({ type: "department", id });
  const workers = await fetchAllPaginated<Worker>({ type: "worker" });

  const workerQuantity = workers.filter(
    ({ department: workerDepartment }: Worker) =>
      (department?._id as string) === (workerDepartment?._id as string)
  ).length;

  return (
    <DepartmentDetail department={department} workerQuantity={workerQuantity} />
  );
}
