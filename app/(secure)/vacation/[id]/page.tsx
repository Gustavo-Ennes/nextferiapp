import { VacationDetail } from "../components/VacationDetail";
import { redirect } from "next/navigation";
import { fetchOne } from "../../utils";
import type { VacationDTO } from "@/dto";

export default async function VacationViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vacation = await fetchOne<VacationDTO>({ type: "vacation", id });

  if (vacation) {
    return <VacationDetail vacation={vacation} />;
  }

  return redirect("/not-found");
}
