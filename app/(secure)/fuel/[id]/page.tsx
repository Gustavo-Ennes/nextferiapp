import { redirect } from "next/navigation";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import { FuelDetail } from "../components/FuelDetail";

export default async function FuelViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const fuel = await FuelRepository.findOne({ id });
  if (!fuel) {
    console.warn("No fuel found");
    return redirect("notFound");
  }

  return <FuelDetail fuel={fuel} />;
}
