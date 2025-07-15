import { Department } from "@/app/types";
import { ResponsiveListPage } from "../components/ResponsiveListPage";

const DepartmentListPage = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/department`);
  const { departments } = await res.json();
  return (
    <ResponsiveListPage<Department>
      items={departments ?? []}
      routePrefix="department"
    />
  );
};

export default DepartmentListPage;
