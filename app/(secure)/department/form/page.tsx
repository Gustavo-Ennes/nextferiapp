import { Container } from "@mui/material";
import { DepartmentForm } from "../components/DepartmentForm";
import { TitleTypography } from "../../components/TitleTypography";
import { fetchAllPaginated, fetchOne } from "../../utils";
import type { BossDTO, DepartmentDTO } from "@/dto";

export default async function DepartmentFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const { id } = await searchParams;
  const department = await fetchOne<DepartmentDTO>({ type: "department", id });
  const bosses = await fetchAllPaginated<BossDTO>({
    type: "boss",
    params: { isExternal: false, isActive: true },
  });

  return (
    <Container maxWidth={"sm"} sx={{ mt: 1 }}>
      {(!id || (id && department)) && (
        <>
          <TitleTypography>
            {id ? "Editar Departamento" : "Criar Departamento"}
          </TitleTypography>

          <DepartmentForm defaultValues={department} bosses={bosses} />
        </>
      )}
    </Container>
  );
}
