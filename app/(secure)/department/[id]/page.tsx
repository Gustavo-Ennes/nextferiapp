import { DepartmentDetail } from "../components/DepartmentDetail";
import { Worker } from "@/app/types";

export default async function DepartmentViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: department } = await (
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/department/${id}`)
  ).json();
  const { data: workers } = await (
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/worker`)
  ).json();

  const workerQuantity = workers.filter(
    ({ department: workerDepartment }: Worker) =>
      department?._id === workerDepartment?._id
  ).length;

  return (
    <DepartmentDetail department={department} workerQuantity={workerQuantity} />
  );
}
