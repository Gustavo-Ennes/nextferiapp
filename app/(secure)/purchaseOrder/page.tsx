import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import { ResponsiveListPage } from "../components/ResponsiveListPage";
import type { RawSearchParams } from "../types";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import { PurchaseOrderAdditionalButton } from "./components/PurchaseOrderAdditionalButton";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import { getOrderWarningsMap } from "./utils";

const PurchaseOrderList = async ({
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

  const additionalButtons = [
    <PurchaseOrderAdditionalButton key="pdf-preview-btn" />,
  ];

  const warnings = getOrderWarningsMap({
    orders: paginatedResponse.data,
    fuels,
  });

  return (
    <ResponsiveListPage<PurchaseOrderDTO>
      paginatedResponse={paginatedResponse}
      routePrefix="purchaseOrder"
      contains={contains}
      additionalButtons={additionalButtons}
      warnings={warnings}
    />
  );
};

export default PurchaseOrderList;
