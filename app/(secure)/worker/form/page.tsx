import { WorkerForm } from "../components/WorkerForm";
import { Container, Typography } from "@mui/material";

export default async function WorkerFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const { id } = await searchParams;
  const { data: worker } = await (
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/worker/${id}`)
  ).json();
  const { data: departments } = await (
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/department`)
  ).json();

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      {(!id || (id && worker)) && (
        <>
          <Typography variant="h5" gutterBottom mb={2}>
            {id ? "Editar Servidor" : "Criar Servidor"}
          </Typography>

          <WorkerForm defaultValues={worker} departments={departments} />
        </>
      )}
    </Container>
  );
}
