import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import type { RawSearchParams } from "../types";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import { getPurchaseOrderRowFlags } from "./utils";
import { PurchaseOrderList } from "./components/PurchaseOrderList";
import { SupplierRepository } from "@/lib/repository/supplier/supplier";

const PurchaseOrderListServer = async ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => {
  const { page, contains, supplier, hideLowBalance, hideOutdated } =
    await searchParams;

  const paginatedResponse = await PurchaseOrderRepository.find({
    page: page ? (parseInt(page) ?? 1) : 1,
    ...(contains && { contains }),
    supplier,
    hideLowBalance,
    hideOutdated,
  });
  const fuels = await FuelRepository.findWithoutPagination!({});
  const suppliers = await SupplierRepository.findWithoutPagination!({});

  const rowFlags = getPurchaseOrderRowFlags({
    orders: paginatedResponse.data,
    fuels,
  });

  return (
    <PurchaseOrderList
      paginatedResponse={paginatedResponse}
      suppliers={suppliers}
      routePrefix="purchaseOrder"
      contains={contains}
      rowFlags={rowFlags}
    />
  );
};

export default PurchaseOrderListServer;
