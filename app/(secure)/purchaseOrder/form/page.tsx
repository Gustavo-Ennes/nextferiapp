import { TitleTypography } from "../../components/TitleTypography";
import { Container } from "@mui/material";
import { PurchaseOrderRepository } from "@/lib/repository/purchaseOrder/purchaseOrder";
import { PurchaseOrderForm } from "../components/PurchaseOrderForm";
import { DepartmentRepository } from "@/lib/repository/department/department";
import { FuelRepository } from "@/lib/repository/fuel/fuel";

export default async function PurchaseOrderFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const { id } = await searchParams;

  const purchaseOrder = await PurchaseOrderRepository.findOne({ id });
  const departments = await DepartmentRepository.findWithoutPagination!({
    page: 1,
    isActive: true,
  });
  const fuels = await FuelRepository.findWithoutPagination!({});

  return (
    <Container maxWidth={"sm"} sx={{ mt: 1 }}>
      {(!id || (id && purchaseOrder)) && (
        <>
          <TitleTypography>
            {id ? "Editar Pedido" : "Criar Pedido"}
          </TitleTypography>

          <PurchaseOrderForm
            defaultValues={purchaseOrder}
            departments={departments}
            fuels={fuels}
          />
        </>
      )}
    </Container>
  );
}
