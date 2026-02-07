import { Container } from "@mui/material";
import { BossForm } from "../components/BossForm";
import { TitleTypography } from "../../components/TitleTypography";
import { fetchAll } from "../../utils";
import type { BossDTO, WorkerDTO } from "@/dto";
import { BossRepository } from "@/lib/repository/boss/boss";
import type { WorkerFormData } from "../../worker/types";
import { WorkerRepository } from "@/lib/repository/worker/worker";

export default async function BossFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  let boss: BossDTO | null = null;

  if (id) boss = await BossRepository.findOne({ id });

  const workers = await fetchAll<WorkerDTO, WorkerFormData>({
    isActive: true,
    isExternal: false,
    entityType: "worker",
    repository: WorkerRepository,
  });

  return (
    <Container maxWidth={"sm"} sx={{ mt: 1 }}>
      {(!id || (id && boss)) && (
        <>
          <TitleTypography>
            {id ? "Editar Chefe" : "Criar Chefe"}
          </TitleTypography>

          <BossForm defaultValues={boss} workers={workers} />
        </>
      )}
    </Container>
  );
}
