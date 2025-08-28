import { VacationDetail } from "../components/VacationDetail";
import { parseVacation } from "../parse";
import { redirect } from "next/navigation";

export default async function VacationViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: vacation } = await (
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/vacation/${id}`)
  ).json();
  if (vacation) {
    const parsedVacation = parseVacation(vacation);
    return <VacationDetail vacation={parsedVacation} />;
  }
  return redirect('/not-found');
}
