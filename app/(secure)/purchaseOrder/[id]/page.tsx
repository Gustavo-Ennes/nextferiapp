import { redirect } from "next/navigation";
import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import { PurchaseOrderDetail } from "../components/PurchaseOrderDetail";
import { FuelRepository } from "@/lib/repository/fuel/fuel";

export default async function PurchaseOrderViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const purchaseOrder = await PurchaseOrderRepository.findOne({ id });
  const { data: fuels } = await FuelRepository.find({});

  if (!purchaseOrder) redirect("/notFound");

  return <PurchaseOrderDetail purchaseOrder={purchaseOrder} fuels={fuels} />;
}
