import type { Boss } from "@/app/types";
import { fetchOne } from "../../utils";
import { BossDetail } from "../components/BossDetail";

export default async function BossViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const boss = await fetchOne<Boss>({ type: "boss", id });

  return <BossDetail boss={boss} />;
}
