import { Container, Typography } from "@mui/material";
import { DepartmentForm } from "../components/DepartmentForm";

export default async function DepartmentFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const { id } = await searchParams;
  const { data: department } = await (
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/department/${id}`)
  ).json();

  return (
    <Container maxWidth={"xl"} sx={{ mt: 1 }}>
      {(!id || (id && department)) && (
        <>
          <Typography variant="h5" gutterBottom mb={2}>
            {id ? "Editar Departamento" : "Criar Departamento"}
          </Typography>

          <DepartmentForm defaultValues={department} />
        </>
      )}
    </Container>
  );
}
