import type { Worker } from "@/app/types";
import { fetchOne } from "../../utils";
import { WorkerDetail } from "../components/WorkerDetail";

export default async function WorkerViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const worker = await fetchOne<Worker>({ type: "worker", id });

  return <WorkerDetail worker={worker} />;
}
