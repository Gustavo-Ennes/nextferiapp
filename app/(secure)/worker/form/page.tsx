import type { Department, Worker } from "@/app/types";
import { TitleTypography } from "../../components/TitleTypography";
import { fetchAllPaginated, fetchOne } from "../../utils";
import { WorkerForm } from "../components/WorkerForm";
import { Container } from "@mui/material";

export default async function WorkerFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const { id } = await searchParams;

  const worker = await fetchOne<Worker>({ type: "worker", id });
  const departments = await fetchAllPaginated<Department>({
    type: "department",
  });

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
