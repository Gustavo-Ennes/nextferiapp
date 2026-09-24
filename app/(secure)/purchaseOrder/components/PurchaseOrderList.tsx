"use client";
import type { PurchaseOrderDTO } from "@/dto/PurchaseOrderDTO";
import { ResponsiveListPage } from "../../components/ResponsiveListPage";
import type { ResponsiveListPageParam } from "../../components/types";
import { usePdfPreview } from "@/context/PdfPreviewContext";
import { useRouter } from "@/context/RouterContext";
import { useDialog } from "@/context/DialogContext";

export const PurchaseOrderList = (
  params: ResponsiveListPageParam<PurchaseOrderDTO>,
) => {
  const { redirectWithLoading } = useRouter();
  const { setPdf } = usePdfPreview();
  const { openSelectDialog } = useDialog();

  const menuItems = [
    {
      label: `Novo pedido`,
      action: () => redirectWithLoading(`/purchaseOrder/form`),
    },
    {
      label: "Impr. Orientação NF",
      action: () =>
        openSelectDialog({
          title: "Selecione o fornecedor",
          options: params.suppliers?.map((supplier) => ({
            label: supplier.name,
            value: supplier._id,
          })),
          onConfirmAction: (supplier?: string) =>
            setPdf({ items: [{ type: "purchaseOrder", supplier }] }),
        }),
    },
  ];
  return (
    <ResponsiveListPage<PurchaseOrderDTO> {...params} menuItems={menuItems} />
  );
};
