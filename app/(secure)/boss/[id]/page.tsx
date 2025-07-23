import { BossDetail } from "../components/BossDetail";

export default async function BossViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: boss } = await (
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/boss/${id}`)
  ).json();

  return <BossDetail boss={boss} />;
}
