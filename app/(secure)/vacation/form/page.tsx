import { Container } from "@mui/material";
import { VacationForm } from "../components/VacationForm";
import type { VacationType } from "@/lib/repository/vacation/types";
import { TitleTypography } from "../../components/TitleTypography";
import { translateEntityKey } from "@/app/translate";
import type { BossDTO, VacationDTO, WorkerDTO } from "@/dto";
import { VacationRepository } from "@/lib/repository/vacation/vacation";
import { fetchAll } from "../../utils";
import type { BossFormData } from "../../boss/types";
import { BossRepository } from "@/lib/repository/boss/boss";
import type { WorkerFormData } from "../../worker/types";
import { WorkerRepository } from "@/lib/repository/worker/worker";

export default async function VacationFormPage({
  searchParams,
}: {
  searchParams: Promise<{
    id: string;
    type: VacationType;
    isReschedule?: boolean;
  }>;
}) {
  const { id, type, isReschedule } = await searchParams;
  let vacation: VacationDTO | null = null;

  // quering for a cancelled vacation in case of reschedule
  // just to use the defaultValues
  if (id)
    vacation = await VacationRepository.findOne({
      id,
      ...(isReschedule && { cancelled: true }),
    });

  const bosses = await fetchAll<BossDTO, BossFormData>({
    isActive: true,
    isExternal: false,
    entityType: "boss",
    repository: BossRepository,
  });

  const workers = await fetchAll<WorkerDTO, WorkerFormData>({
    isActive: true,
    isExternal: false,
    entityType: "worker",
    repository: WorkerRepository,
  });

  const title = `${
    isReschedule ? "Reagendar" : id ? "Editar" : "Criar"
  } ${translateEntityKey({ entity: "vacation", key: type }).toLowerCase()}`;

  return (
    <Container maxWidth={"sm"} sx={{ mt: 1 }}>
      {(!id || (id && vacation)) && (
        <>
          <TitleTypography>{title}</TitleTypography>
          <VacationForm
            defaultValues={vacation}
            type={type}
            bosses={bosses}
            workers={workers}
            id={id}
            isReschedule={isReschedule}
          />
        </>
      )}
    </Container>
  );
}
