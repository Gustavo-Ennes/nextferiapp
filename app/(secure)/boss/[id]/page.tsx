import type { BossDTO } from "@/dto";
import { fetchOne } from "../../utils";
import { BossDetail } from "../components/BossDetail";

export default async function BossViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const boss = await fetchOne<BossDTO>({ type: "boss", id });

  return <BossDetail boss={boss} />;
}
