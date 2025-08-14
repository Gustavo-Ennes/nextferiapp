import { Container } from "@mui/material";
import { VacationForm } from "../components/VacationForm";
import { VacationType } from "../types";
import { TitleTypography } from "../../components/TitleTypography";

export default async function VacationFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string; type: VacationType }>;
}) {
  const { id, type } = await searchParams;
  const { data: vacation } = await (
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/vacation/${id}`)
  ).json();
  const { data: bosses } = await (
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/boss`)
  ).json();
  const { data: workers } = await (
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/worker`)
  ).json();

  return (
    <Container maxWidth={"sm"} sx={{ mt: 1 }}>
      {(!id || (id && vacation)) && (
        <>
          <TitleTypography>
            {id ? "Editar Folga" : "Criar Folga"}
          </TitleTypography>
          <VacationForm
            defaultValues={vacation}
            type={type}
            bosses={bosses}
            workers={workers}
            id={id}
          />
        </>
      )}
    </Container>
  );
}
