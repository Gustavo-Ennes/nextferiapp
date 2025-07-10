import { auth } from "@/auth";
import { redirect } from "next/navigation";

const VacationList = async () => {
  const session = await auth();

  if (!session) redirect("login");

  return <p>['lista', 'de', 'férias']</p>;
};

export default VacationList;
