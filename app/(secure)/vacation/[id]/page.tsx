import { VacationDetail } from "../components/VacationDetail";
import { parseVacation } from "../parse";
import { redirect } from "next/navigation";
import type { Vacation } from "@/app/types";
import { fetchOne } from "../../utils";

export default async function VacationViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vacation = await fetchOne<Vacation>({ type: "vacation", id });

  if (vacation) {
    const parsedVacation = parseVacation(vacation);
    return <VacationDetail vacation={parsedVacation} />;
  }

  return redirect("/not-found");
}
