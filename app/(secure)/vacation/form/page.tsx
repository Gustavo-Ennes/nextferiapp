import { Container } from "@mui/material";
import { VacationForm } from "../components/VacationForm";
import type { VacationType } from "@/lib/repository/vacation/types";
import { TitleTypography } from "../../components/TitleTypography";
import { translateEntityKey } from "@/app/translate";
import { fetchAllPaginated, fetchOne } from "../../utils";
import type { BossDTO, VacationDTO, WorkerDTO } from "@/dto";

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
  let vacation: VacationDTO | undefined;

  // quering for a cancelled vacation in case of reschedule
  // just to use the defaultValues
  if (id)
    vacation = await fetchOne<VacationDTO>({
      type: "vacation",
      id,
      ...(isReschedule && { params: { cancelled: true } }),
    });

  const bosses = await fetchAllPaginated<BossDTO>({
    type: "boss",
    params: { isExternal: false, isActive: true },
  });
  const workers = await fetchAllPaginated<WorkerDTO>({
    type: "worker",
    params: { isActive: true, isExternal: false },
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
