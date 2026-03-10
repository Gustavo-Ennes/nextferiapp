import { TitleTypography } from "../../components/TitleTypography";
import { Container } from "@mui/material";
import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import { PurchaseOrderForm } from "../components/PurchaseOrderForm";

export default async function PurchaseOrderFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const { id } = await searchParams;

  const purchaseOrder = await PurchaseOrderRepository.findOne({ id });

  return (
    <Container maxWidth={"sm"} sx={{ mt: 1 }}>
      {(!id || (id && purchaseOrder)) && (
        <>
          <TitleTypography>
            {id ? "Editar Pedido" : "Criar Pedido"}
          </TitleTypography>

          <PurchaseOrderForm defaultValues={purchaseOrder} />
        </>
      )}
    </Container>
  );
}
