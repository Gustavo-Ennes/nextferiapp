import { Container } from "@mui/material";
import { DepartmentForm } from "../components/DepartmentForm";
import { TitleTypography } from "../../components/TitleTypography";
import { fetchAll } from "../../utils";
import type { BossDTO } from "@/dto";
import { DepartmentRepository } from "@/lib/repository/department/department";
import type { BossFormData } from "../../boss/types";
import { BossRepository } from "@/lib/repository/boss/boss";

export default async function DepartmentFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const { id } = await searchParams;
  const department = await DepartmentRepository.findOne({ id });
  const bosses = await fetchAll<BossDTO, BossFormData>({
    isExternal: false,
    isActive: true,
    entityType: "boss",
    repository: BossRepository,
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
