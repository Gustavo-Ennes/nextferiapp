import { TitleTypography } from "../../components/TitleTypography";
import { WorkerForm } from "../components/WorkerForm";
import { Container } from "@mui/material";

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
    <Container maxWidth={"sm"} sx={{ mt: 1 }}>
      {(!id || (id && worker)) && (
        <>
          <TitleTypography>
            {id ? "Editar Servidor" : "Criar Servidor"}
          </TitleTypography>

          <WorkerForm defaultValues={worker} departments={departments} />
        </>
      )}
    </Container>
  );
}
