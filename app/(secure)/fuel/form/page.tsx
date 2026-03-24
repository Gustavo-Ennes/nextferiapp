import { TitleTypography } from "../../components/TitleTypography";
import { Container } from "@mui/material";
import { FuelRepository } from "@/lib/repository/fuel/fuel";
import { FuelForm } from "../components/FuelForm";

export default async function FuelFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const { id } = await searchParams;

  const fuel = await FuelRepository.findOne({ id });
  const fuels = await FuelRepository.findWithoutPagination!({});

  return (
    <Container maxWidth={"sm"} sx={{ mt: 1 }}>
      {(!id || (id && fuel)) && (
        <>
          <TitleTypography>
            {id ? "Editar Combustível" : "Criar Combustível"}
          </TitleTypography>

          <FuelForm defaultValues={fuel} fuels={fuels} />
        </>
      )}
    </Container>
  );
}
