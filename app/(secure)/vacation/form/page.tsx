import { Container } from "@mui/material";
import { VacationForm } from "../components/VacationForm";
import type { VacationType } from "../types";
import { TitleTypography } from "../../components/TitleTypography";
import { translateEntityKey } from "@/app/translate";
import type { Boss, Vacation, Worker } from "@/app/types";
import { fetchAllPaginated, fetchOne } from "../../utils";

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
  let vacation: Vacation | undefined;

  // quering for a cancelled vacation in case of reschedule
  // just to use the defaultValues
  if (id)
    vacation = await fetchOne<Vacation>({
      type: "vacation",
      id,
      ...(isReschedule && { params: { cancelled: true } }),
    });

  const bosses = await fetchAllPaginated<Boss>({
    type: "boss",
    params: { isExternal: false },
  });
  const workers = await fetchAllPaginated<Worker>({
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
            id={isReschedule ? id : undefined}
            isReschedule={isReschedule}
          />
        </>
      )}
    </Container>
  );
}
