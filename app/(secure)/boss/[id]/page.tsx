import { BossDetail } from "../components/BossDetail";
import { BossRepository } from "@/lib/repository/boss/boss";
import { redirect } from "next/navigation";

export default async function BossViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const boss = await BossRepository.findOne({ id });

  if (!boss) redirect("/notFound");

  return <BossDetail boss={boss} />;
}
