import { Container, Typography } from "@mui/material";
import { VacationForm } from "../components/VacationForm";

export default async function VacationFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const { id } = await searchParams;
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
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      {(!id || (id && vacation)) && (
        <>
          <Typography variant="h5" gutterBottom mb={2}>
            {id ? "Editar Folga" : "Criar Folga"}
          </Typography>
          <VacationForm
            defaultValues={vacation}
            bosses={bosses}
            workers={workers}
            id={id}
          />
        </>
      )}
    </Container>
  );
}
