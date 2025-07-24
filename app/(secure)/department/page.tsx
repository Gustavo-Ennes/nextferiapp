import { Department } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";

const DepartmentList = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: number }>;
}) => {
  const { page } = await searchParams;
  const fetchDepartments = async () => {
    "use server";
    return fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/department?page=${page ?? 1}`
    );
  };
  const res = await fetchDepartments();
  const paginatedResponse = await res.json();

  return (
    <ResponsiveListPage<Department>
      paginatedResponse={paginatedResponse}
      routePrefix="department"
    />
  );
};

export default DepartmentList;
