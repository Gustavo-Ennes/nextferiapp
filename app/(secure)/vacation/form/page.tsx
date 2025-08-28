import { Container } from "@mui/material";
import { VacationForm } from "../components/VacationForm";
import type { VacationType } from "../types";
import { TitleTypography } from "../../components/TitleTypography";
import { translateEntityKey } from "@/app/translate";
import type { Vacation } from "@/app/types";

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
  const cancelledSearchParam = "?cancelled=true";
  let vacation: { data?: Vacation } = {};

  // quering for a cancelled vacation in case of reschedule
  // just to use the defaultValues
  if (id)
    vacation = await (
      await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/vacation/${id}${
          isReschedule ? cancelledSearchParam : ""
        }`
      )
    ).json();
  const { data: bosses } = await (
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/boss`)
  ).json();
  const { data: workers } = await (
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/worker`)
  ).json();

  const title = `${
    isReschedule ? "Reagendar" : id ? "Editar" : "Criar"
  } ${translateEntityKey({ entity: "vacation", key: type }).toLowerCase()}`;

  return (
    <Container maxWidth={"sm"} sx={{ mt: 1 }}>
      {(!id || (id && vacation)) && (
        <>
          <TitleTypography>{title}</TitleTypography>
          <VacationForm
            defaultValues={vacation.data}
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
