import type { DepartmentDTO, WorkerDTO } from "@/dto";
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

  const worker = await fetchOne<WorkerDTO>({ type: "worker", id });
  const departments = await fetchAllPaginated<DepartmentDTO>({
    type: "department",
    params: { isActive: true },
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
