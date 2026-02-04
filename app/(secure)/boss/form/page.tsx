import { Container } from "@mui/material";
import { BossForm } from "../components/BossForm";
import { TitleTypography } from "../../components/TitleTypography";
import { fetchAllPaginated, fetchOne } from "../../utils";
import type { BossDTO, WorkerDTO } from "@/dto";

export default async function BossFormPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  let boss: BossDTO | undefined;

  if (id) boss = await fetchOne<BossDTO>({ type: "boss", id });

  const workers = await fetchAllPaginated<WorkerDTO>({
    type: "worker",
    params: { isActive: true, isExternal: false },
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
