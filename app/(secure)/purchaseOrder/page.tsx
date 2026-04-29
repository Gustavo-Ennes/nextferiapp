import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import { ResponsiveListPage } from "../components/ResponsiveListPage";
import type { RawSearchParams } from "../types";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import { PurchaseOrderAdditionalButton } from "./components/PurchaseOrderAdditionalButton";

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

  const additionalButtons = [
    <PurchaseOrderAdditionalButton key="pdf-preview-btn" />,
  ];

  return (
    <ResponsiveListPage<PurchaseOrderDTO>
      paginatedResponse={paginatedResponse}
      routePrefix="purchaseOrder"
      contains={contains}
      additionalButtons={additionalButtons}
    />
  );
};

export default PurchaseOrderList;
