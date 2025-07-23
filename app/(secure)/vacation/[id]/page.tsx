import { VacationDetail } from "../components/VacationDetail";
import { parseVacation } from "../parse";

export default async function VacationViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: vacation } = await (
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/vacation/${id}`)
  ).json();
  const parsedVacation = parseVacation(vacation);

  return <VacationDetail vacation={parsedVacation} />;
}
