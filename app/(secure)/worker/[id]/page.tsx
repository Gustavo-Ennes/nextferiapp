import { WorkerDetail } from "../components/WorkerDetail";

export default async function WorkerViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: worker } = await (
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/worker/${id}`)
  ).json();

  return <WorkerDetail worker={worker} />;
}
