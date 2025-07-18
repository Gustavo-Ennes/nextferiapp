import { Department } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";

const DepartmentList = async () => {
  const fetchDepartments = async () => {
    "use server";
    return fetch(`${process.env.NEXT_PUBLIC_URL}/api/department`);
  };
  const res = await fetchDepartments();
  const { data: departments } = await res.json();

  return (
    <ResponsiveListPage<Department>
      items={departments ?? []}
      routePrefix="department"
      refetch={fetchDepartments}
    />
  );
};

export default DepartmentList;
