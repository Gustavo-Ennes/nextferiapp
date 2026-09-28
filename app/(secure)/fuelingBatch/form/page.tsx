import { DepartmentRepository } from "@/lib/repository/department/department";
import { FuelingBatchRepository } from "@/lib/repository/fuelingBatch/fuelingBatch";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import { redirect } from "next/navigation";
import { FuelingBatchForm } from "./FuelingBatchForm";
import type { FuelingBatchDTO } from "@/dto";
import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";

export default async function FuelingBatchFormServerPage({
  searchParams,
}: {
  searchParams: Promise<{
    id: string;
  }>;
}) {
  const { id } = await searchParams;
  let fuelingBatch: FuelingBatchDTO | null = null;

  if (id) {
    fuelingBatch = await FuelingBatchRepository.findById(id);
  }

  if (id && !fuelingBatch) {
    console.warn(`Provided id doesn't work.`);
    redirect(`/fuelingBatch`);
  }

  const departments = await DepartmentRepository.findWithoutPagination!({
    isActive: true,
  });

  const fuels = await FuelRepository.findWithoutPagination!({});

  const purchaseOrders = await PurchaseOrderRepository.findWithoutPagination!({
    isActive: true,
  });

  return (
    <FuelingBatchForm
      key={fuelingBatch?._id ?? "new"}
      fuelingBatch={fuelingBatch}
      departments={departments}
      fuels={fuels}
      purchaseOrders={purchaseOrders}
    />
  );
}
