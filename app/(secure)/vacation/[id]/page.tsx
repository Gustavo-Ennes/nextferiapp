import { VacationDetail } from "../components/VacationDetail";
import { redirect } from "next/navigation";
import { VacationRepository } from "@/lib/repository/vacation/vacation";

export default async function VacationViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vacation = await VacationRepository.findOne({
    id,
  });

  if (vacation) {
    return <VacationDetail vacation={vacation} />;
  }

  return redirect("/not-found");
}
