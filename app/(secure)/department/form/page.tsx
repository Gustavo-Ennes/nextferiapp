import { Container, Typography } from "@mui/material";
import { DepartmentForm } from "../components/DepartmentForm";
import { TitleTypography } from "../../components/TitleTypography";

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
    <Container maxWidth={"sm"} sx={{ mt: 1 }}>
      {(!id || (id && department)) && (
        <>
          <TitleTypography>
            {id ? "Editar Departamento" : "Criar Departamento"}
          </TitleTypography>

          <DepartmentForm defaultValues={department} />
        </>
      )}
    </Container>
  );
}
