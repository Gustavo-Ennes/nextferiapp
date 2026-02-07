import type { DepartmentDTO } from "@/dto";
import { TitleTypography } from "../../components/TitleTypography";
import { fetchAll } from "../../utils";
import { WorkerForm } from "../components/WorkerForm";
import { Container } from "@mui/material";
import { WorkerRepository } from "@/lib/repository/worker/worker";
import type { DepartmentFormData } from "../../department/types";
import { DepartmentRepository } from "@/lib/repository/department/department";

export default async function WorkerFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const { id } = await searchParams;

  const worker = await WorkerRepository.findOne({ id });
  const departments = await fetchAll<DepartmentDTO, DepartmentFormData>({
    entityType: "department",
    repository: DepartmentRepository,
    isActive: true,
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
