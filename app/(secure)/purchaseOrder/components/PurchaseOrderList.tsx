"use client";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import { ResponsiveListPage } from "../../components/ResponsiveListPage";
import type { ResponsiveListPageParam } from "../../components/types";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import { useRouter } from "@/context/RouterContext";

export const PurchaseOrderList = (
  params: ResponsiveListPageParam<PurchaseOrderDTO>,
) => {
  const { redirectWithLoading } = useRouter();
  const { setPdf } = usePdfPreview();
  const menuItems = [
    {
      label: `Novo pedido`,
      action: () => redirectWithLoading(`/purchaseOrder/form`),
    },
    {
      label: "Impr. Orientação NF",
      action: () => setPdf({ items: [{ type: "purchaseOrder" }] }),
    },
  ];
  return (
    <ResponsiveListPage<PurchaseOrderDTO> {...params} menuItems={menuItems} />
  );
};
