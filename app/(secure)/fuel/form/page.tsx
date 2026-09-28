import { TitleTypography } from "../../components/TitleTypography";
import { Container } from "@mui/material";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import { FuelForm } from "../components/FuelForm";
import { SupplierRepository } from "@/lib/repository/supplier/supplier";

export default async function FuelFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const { id } = await searchParams;

  const fuel = await FuelRepository.findOne({ id });
  const fuels = await FuelRepository.findWithoutPagination!({});
  const suppliers = await SupplierRepository.findWithoutPagination!({})

  return (
    <Container maxWidth={"sm"} sx={{ mt: 1 }}>
      {(!id || (id && fuel)) && (
        <>
          <TitleTypography>
            {id ? "Editar Combustível" : "Criar Combustível"}
          </TitleTypography>

          <FuelForm defaultValues={fuel} fuels={fuels} suppliers={suppliers} />
        </>
      )}
    </Container>
  );
}
