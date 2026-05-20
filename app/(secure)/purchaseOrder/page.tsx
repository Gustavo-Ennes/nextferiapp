import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import type { RawSearchParams } from "../types";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import { getOrderWarningsMap } from "./utils";
import { PurchaseOrderList } from "./components/PurchaseOrderList";

const PurchaseOrderListServer = async ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => {
  const { page, contains } = await searchParams;

  const paginatedResponse = await PurchaseOrderRepository.find({
    page: page ? (parseInt(page) ?? 1) : 1,
    ...(contains && { contains }),
  });
  const fuels = await FuelRepository.findWithoutPagination!({});

  const warnings = getOrderWarningsMap({
    orders: paginatedResponse.data,
    fuels,
  });

  return (
    <PurchaseOrderList
      paginatedResponse={paginatedResponse}
      routePrefix="purchaseOrder"
      contains={contains}
      warnings={warnings}
    />
  );
};

export default PurchaseOrderListServer;
