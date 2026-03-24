import { TitleTypography } from "../../components/TitleTypography";
import { Container } from "@mui/material";
import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import { PurchaseOrderUpdatePage } from "../components/PurchaseOrderUpdate/PurchaseOrderUpdate";

export default async function PurchaseOrderFormPage() {
  const purchaseOrders = await PurchaseOrderRepository.findWithoutPagination!(
    {},
  );

  return (
    <Container maxWidth={"sm"} sx={{ mt: 1 }}>
      {purchaseOrders && (
        <>
          <TitleTypography>Atualizar pedidos</TitleTypography>

          <PurchaseOrderUpdatePage orders={purchaseOrders} />
        </>
      )}
    </Container>
  );
}
